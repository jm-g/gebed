package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestServesIndex(t *testing.T) {
	rec := httptest.NewRecorder()
	Handler().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))
	if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), "gebed") {
		t.Fatalf("got %d %q", rec.Code, rec.Body.String())
	}
}
