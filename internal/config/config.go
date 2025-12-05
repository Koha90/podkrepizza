package config

import (
	"log"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	HTTP   HTTP   `toml:"http"`
	Store  Store  `toml:"store"`
	Logger Logger `toml:"logger"`
}

type HTTP struct {
	Port         int           `toml:"port"`
	IdleTimeout  time.Duration `toml:"idle_timeout"`
	ReadTimeout  time.Duration `toml:"read_timeout"`
	WriteTimeout time.Duration `toml:"write_timeout"`
}

type Store struct {
	Host     string `toml:"host"`
	Port     int    `toml:"port"`
	Database string `toml:"database"`
	Username string `toml:"username"`
	Password string `toml:"password"`
	Shema    string `toml:"shema"`
}

type Logger struct {
	Env string `toml:"env"`
}

func MustLoad() *Config {
	var cfg Config
	if err := cleanenv.ReadConfig("./config/config.toml", &cfg); err != nil {
		log.Fatalf("Невозможно прочитать конфиг: %s", err)
	}

	return &cfg
}
