package server

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/koha90/podkrepizza/internal/models"
)

func (s *Server) adminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		s.log.Debug("ADMIN CHECK")
		c, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		tkn, err := jwt.ParseWithClaims(c.Value, &models.Claims{}, func(t *jwt.Token) (any, error) {
			return jwtKey, nil
		})
		if err != nil || !tkn.Valid {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		claims := tkn.Claims.(*models.Claims)
		s.log.Debug("ADMIN CHECK", "email", claims.Email)
		user, err := s.db.UserByEmail(claims.Email)
		if err != nil || user.Role != "admin" {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
