package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/rs/zerolog/log"
	"github.com/spf13/viper"
)

type Config struct {
	viper.Viper

	configPath string
}

func (c *Config) Load(args []string) error {
	c.Viper = *viper.New()
	c.SetConfigName("config")
	c.SetConfigType("yaml")

	cfgdir, err := os.UserConfigDir()
	if err != nil {
		return nil
	}
	cfgdir = filepath.Join(cfgdir, "jadexw")

	c.AddConfigPath(cfgdir)
	c.configPath = cfgdir
	err = c.ReadInConfig()

	if err != nil {
		if verr, ok := err.(viper.ConfigFileNotFoundError); ok {
			// it's ok if config file is not found. fall back to environment.
			log.Err(verr).Msg("no config file found; falling back to environment variables")
		} else {
			panic(fmt.Errorf("fatal error config file: %w", err))
		}
	}
	c.SetEnvPrefix("jadexw")
	// allow env vars to be specified with `_` instead of `-`
	replacer := strings.NewReplacer("-", "_")
	c.SetEnvKeyReplacer(replacer)

	c.BindEnv("montecarlo-plies")

	c.SetDefault("montecarlo-plies", 2)
	c.SetDefault("ttable-mem-fraction", 0.25)

	return nil
}
