package database

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/koha90/podkrepizza/internal/models"
)

// UserByEmail ...
func (s *service) UserByEmail(email string) (*models.User, error) {
	const op = "database.User"

	var user models.User
	var name, phone sql.NullString

	err := s.db.QueryRow(`
		SELECT id, email, name, phone, is_admin, is_blocked, created_at, updated_at
		FROM users
		WHERE email=$1;
		`, email).Scan(&user.ID, &user.Email, &name, &phone, &user.IsAdmin, &user.IsBlocked, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	if name.Valid {
		user.Name = name.String
	}

	if phone.Valid {
		user.Phone = phone.String
	}

	return &user, nil
}

// UpdateUserByEmail ...
func (s *service) UpdateUserByEmail(email string, name *string, phone *string) error {
	const op = "database.UpdateUserByEmail"

	query := `
		UPDATE users
		SET name = COALESCE(NULLIF($1, ''), name),
				phone = COALESCE(NULLIF($2, ''), phone),
				updated_at = $5
		WHERE email = $6
	`

	_, err := s.db.Exec(
		query,
		name,
		phone,
		time.Now(),
		email,
	)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}

	return nil
}
