package database

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/koha90/podkrepizza/internal/models"
)

// AllUsers ...
func (s *service) AllUsers() ([]*models.User, error) {
	const op = "database.AllUsers"

	var users []*models.User

	query := `
		SELECT id, email, name, phone, role, is_blocked, created_at, updated_at
		FROM users
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("%s: query error: %w", op, err)
	}
	defer rows.Close()

	for rows.Next() {
		var (
			u     models.User
			name  sql.NullString
			phone sql.NullString
		)
		if err := rows.Scan(&u.ID, &u.Email, &name, &phone, &u.Role, &u.IsBlocked, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, fmt.Errorf("%s: scan error: %w", op, err)
		}

		if name.Valid {
			u.Name = name.String
		} else {
			u.Name = ""
		}

		if phone.Valid {
			u.Phone = phone.String
		} else {
			u.Phone = ""
		}

		users = append(users, &u)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("%s: rows error: %w", op, err)
	}

	return users, nil
}

// UserByEmail ...
func (s *service) UserByEmail(email string) (*models.User, error) {
	const op = "database.UserByEmail"

	var u models.User
	var name, phone sql.NullString

	err := s.db.QueryRow(`
		SELECT id, email, name, phone, role, is_blocked, created_at, updated_at
		FROM users
		WHERE email=$1;
		`, email).Scan(&u.ID, &u.Email, &name, &phone, &u.Role, &u.IsBlocked, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	if name.Valid {
		u.Name = name.String
	}

	if phone.Valid {
		u.Phone = phone.String
	}

	return &u, nil
}

// UpdateUserByEmail ...
func (s *service) UpdateUserByEmail(email string, name *string, phone *string) error {
	const op = "database.UpdateUserByEmail"

	query := `
		UPDATE users
		SET name = COALESCE(NULLIF($1, ''), name),
				phone = COALESCE(NULLIF($2, ''), phone),
				updated_at = $3
		WHERE email = $4
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

func (s *service) SetUserBlocked(id int64, blocked bool) error {
	const op = "database.SetUserBlocked"

	query := `
		UPDATE users
		SET is_blocked = $1,
				updated_at = Now()
		WHERE id = $2
	`

	_, err := s.db.Exec(query, blocked, id)
	if err != nil {
		return fmt.Errorf("%s: updated error: %w", op, err)
	}

	return nil
}

func (s *service) SetRole(id int64, role string) error {
	const op = "database.SetRole"

	query := `
		UPDATE users
		SET role = $1,
				updated_at = Now()
		WHERE id = $2
	`

	_, err := s.db.Exec(query, role, id)
	if err != nil {
		return fmt.Errorf("%s: updated role error: %w", op, err)
	}

	return nil
}

func (s *service) DeleteUserByID(id int64) error {
	const op = "database.DeleteUserByID"

	query := `DELETE FROM users WHERE id = $1`

	_, err := s.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}

	return nil
}
