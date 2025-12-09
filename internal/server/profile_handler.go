package server

import (
	"encoding/json"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/koha90/podkrepizza/internal/models"
)

// profileHandler - профиль пользователя.
func (s *Server) profileHandler(w http.ResponseWriter, r *http.Request) {
	const op = "server.profileHandler"

	c, err := r.Cookie("token")
	if err != nil {
		s.log.Error(op+": Token error", "error", err)
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	tkn, err := jwt.ParseWithClaims(
		c.Value,
		&models.Claims{},
		func(token *jwt.Token) (any, error) { return jwtKey, nil })
	if err != nil || !tkn.Valid {
		s.log.Error(op+"Parse token error", "error", err)
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	claims := tkn.Claims.(*models.Claims)

	user, err := s.db.UserByEmail(claims.Email)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(user)
}

// profileUpdate - изменение профиля пользователя.
func (s *Server) profileUpdate(w http.ResponseWriter, r *http.Request) {
	const op = "server.profileHandler"

	if r.Method != http.MethodPatch {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	c, err := r.Cookie("token")
	if err != nil {
		s.log.Error(op+": Token error", "error", err)
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	tkn, err := jwt.ParseWithClaims(
		c.Value,
		&models.Claims{},
		func(token *jwt.Token) (any, error) { return jwtKey, nil })
	if err != nil || !tkn.Valid {
		s.log.Error(op+"Parse token error", "error", err)
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	claims := tkn.Claims.(*models.Claims)

	var req struct {
		Name  *string `json:"name"`
		Phone *string `json:"phone"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.log.Error(op+"Decode error", "error", err)
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	err = s.db.UpdateUserByEmail(claims.Email, req.Name, req.Phone)
	if err != nil {
		s.log.Error(op+": update error", "error", err)
		http.Error(w, "failed update", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "updated"})
}
