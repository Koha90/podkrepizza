package server

import (
	"encoding/json"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/koha90/podkrepizza/internal/models"
)

// profileHandler - профиль пользователя.
func (s *Server) profileHandler(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("token")
	if err != nil {
		s.log.Error("Token error", "error", err)
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	tkn, err := jwt.ParseWithClaims(
		c.Value,
		&models.Claims{},
		func(token *jwt.Token) (any, error) { return jwtKey, nil })
	if err != nil || !tkn.Valid {
		s.log.Error("Parse token error", "error", err)
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
