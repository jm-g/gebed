package server

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"gebed/internal/model"
	"gebed/internal/registry"
	"gebed/internal/store"
)

type commentJSON struct {
	ID      string    `json:"id"`
	Author  string    `json:"author"`
	Text    string    `json:"text"`
	Created time.Time `json:"created"`
}

type deliveryJSON struct {
	Name      string `json:"name"`
	Delivered bool   `json:"delivered"`
	Error     string `json:"error,omitempty"`
}

func (a *api) listComments(w http.ResponseWriter, r *http.Request) {
	s, ok := a.open(w, r)
	if !ok {
		return
	}
	id, err := model.ParseID(r.PathValue("id"))
	if err != nil {
		fail(w, http.StatusBadRequest, err)
		return
	}
	cs, err := s.Comments(r.Context(), id)
	if err != nil {
		fail(w, http.StatusBadGateway, err)
		return
	}
	out := make([]commentJSON, 0, len(cs))
	for _, c := range cs {
		out = append(out, commentJSON{c.ID, c.Author.String(), c.Body.String(), c.Created})
	}
	reply(w, http.StatusOK, out)
}

type sessionJSON struct {
	Nick   string `json:"nick"`
	Cwd    string `json:"cwd"`
	Status string `json:"status"`
}

func (a *api) listSessions(w http.ResponseWriter, _ *http.Request) {
	ss, err := a.peers.List()
	out := []sessionJSON{}
	if err == nil { // no sessions dir means no sessions; the UI shows an empty list
		for _, s := range ss {
			out = append(out, sessionJSON{s.Nick(), s.Cwd, s.Status})
		}
	}
	reply(w, http.StatusOK, out)
}

// notify sends the comment to every live session it mentions. The message is
// gebed's own wording around the user's text; it tells the agent where the
// discussion lives so the reply lands there.
func (a *api) notify(repo registry.Repo, b store.Backend, id model.ID, body model.Body) []deliveryJSON {
	mentions := body.Mentions()
	if len(mentions) == 0 {
		return nil
	}
	live, _ := a.peers.List() // no list means every mention is reported undelivered
	out := make([]deliveryJSON, 0, len(mentions))
	for _, m := range mentions {
		d := deliveryJSON{Name: m}
		var target *int
		for i := range live {
			if strings.EqualFold(live[i].Nick(), m) {
				target = &i
				break
			}
		}
		if target == nil {
			d.Error = "no live session with that name"
			out = append(out, d)
			continue
		}
		msg := fmt.Sprintf("%s mentions you in bead %s (repo %s, dir %s):\n\n%s\n\nAnswer in the bead discussion: %s comments add %s --author=%s -- \"<your reply>\"",
			a.user, id, repo.Name, repo.Dir, body, b, id, m)
		if err := a.peers.Send(live[*target], msg); err != nil {
			d.Error = err.Error()
		} else {
			d.Delivered = true
		}
		out = append(out, d)
	}
	return out
}
