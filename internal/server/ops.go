package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"gebed/internal/model"
	"gebed/internal/store"
)

// opJSON is the wire form of an edit; parseOp turns it into a validated store.Op.
type opJSON struct {
	Op       string `json:"op"`
	ID       string `json:"id"`
	From     string `json:"from"`
	On       string `json:"on"`
	Title    string `json:"title"`
	Kind     string `json:"kind"`
	Status   string `json:"status"`
	Label    string `json:"label"`
	Reason   string `json:"reason"`
	Type     string `json:"type"`
	Priority int    `json:"priority"`
	Text     string `json:"text"`
}

func parseOp(o opJSON, user string) (store.Op, error) {
	id, idErr := model.ParseID(o.ID)
	needID := func() error {
		if idErr != nil {
			return fmt.Errorf("id: %w", idErr)
		}
		return nil
	}
	switch o.Op {
	case "create":
		t, err := model.ParseTitle(o.Title)
		if err != nil {
			return nil, err
		}
		k, err := model.ParseKind(o.Kind)
		if err != nil {
			return nil, err
		}
		p, err := model.ParsePriority(o.Priority)
		if err != nil {
			return nil, err
		}
		return store.Create{Title: t, Kind: k, Priority: p}, nil
	case "setTitle":
		t, err := model.ParseTitle(o.Title)
		if err := firstErr(needID(), err); err != nil {
			return nil, err
		}
		return store.SetTitle{ID: id, Title: t}, nil
	case "setStatus":
		s, err := model.ParseStatus(o.Status)
		if err := firstErr(needID(), err); err != nil {
			return nil, err
		}
		return store.SetStatus{ID: id, Status: s}, nil
	case "setPriority":
		p, err := model.ParsePriority(o.Priority)
		if err := firstErr(needID(), err); err != nil {
			return nil, err
		}
		return store.SetPriority{ID: id, Priority: p}, nil
	case "addLabel", "removeLabel":
		l, err := model.ParseLabel(o.Label)
		if err := firstErr(needID(), err); err != nil {
			return nil, err
		}
		if o.Op == "addLabel" {
			return store.AddLabel{ID: id, Label: l}, nil
		}
		return store.RemoveLabel{ID: id, Label: l}, nil
	case "close":
		if err := needID(); err != nil {
			return nil, err
		}
		return store.Close{ID: id, Reason: o.Reason}, nil
	case "reopen":
		if err := needID(); err != nil {
			return nil, err
		}
		return store.Reopen{ID: id}, nil
	case "addComment":
		b, err := model.ParseBody(o.Text)
		au, err2 := model.ParseAuthor(user)
		if err := firstErr(needID(), err, err2); err != nil {
			return nil, err
		}
		return store.AddComment{ID: id, Author: au, Body: b}, nil
	case "addDep":
		from, err1 := model.ParseID(o.From)
		on, err2 := model.ParseRef(o.On)
		t, err3 := model.ParseDepType(o.Type)
		if err := firstErr(err1, err2, err3); err != nil {
			return nil, err
		}
		return store.AddDep{From: from, On: on, Type: t}, nil
	}
	return nil, fmt.Errorf("unknown op %q", o.Op)
}

func firstErr(errs ...error) error {
	for _, e := range errs {
		if e != nil {
			return e
		}
	}
	return nil
}

func (a *api) applyOp(w http.ResponseWriter, r *http.Request) {
	s, ok := a.open(w, r)
	if !ok {
		return
	}
	var in opJSON
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<16))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&in); err != nil {
		fail(w, http.StatusBadRequest, err)
		return
	}
	op, err := parseOp(in, a.user)
	if err != nil {
		fail(w, http.StatusUnprocessableEntity, err)
		return
	}
	a.write.Lock() // one write at a time: br and bd lock their stores themselves, but a clear order helps the UI
	id, err := s.Apply(r.Context(), op)
	a.write.Unlock()
	if err != nil {
		fail(w, http.StatusBadGateway, err)
		return
	}
	res := struct {
		ID        string         `json:"id"`
		Delivered []deliveryJSON `json:"delivered"`
	}{ID: id.String(), Delivered: []deliveryJSON{}}
	if c, ok := op.(store.AddComment); ok {
		repo, _ := a.reg.Find(r.PathValue("name"))
		res.Delivered = append(res.Delivered, a.notify(repo, s.Backend, c.ID, c.Body)...)
	}
	reply(w, http.StatusOK, res)
}
