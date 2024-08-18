package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/rs/zerolog/log"
	"github.com/spf13/viper"

	wglconfig "github.com/domino14/word-golib/config"
)

type Config struct {
	sync.Mutex
	viper.Viper

	configPath string
	wglconfig  *wglconfig.Config
}

// the WGLConfig is a config used for the word-golib library.
func (c *Config) WGLConfig() *wglconfig.Config {
	if c.wglconfig == nil {
		c.Lock()
		defer c.Unlock()
		c.wglconfig = &wglconfig.Config{
			DataPath:      c.GetString("data-path"),
			KWGPathPrefix: c.GetString("kwg-path-prefix"),
		}
	}
	return c.wglconfig
}

func (c *Config) Load(args []string) error {
	c.Viper = *viper.New()
	c.SetConfigName("config")
	c.SetConfigType("yaml")
	// allow env vars to be specified with `_` instead of `-`
	replacer := strings.NewReplacer("-", "_")
	c.SetEnvKeyReplacer(replacer)

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

	c.BindEnv("montecarlo-plies")
	c.BindEnv("ttable-mem-fraction")
	// Ideally these later two should only be settings for the underlying game engine,
	// but I'm not yet sure how those are going to be communicated.
	// We may want to allow Jade to be used in an ENGINELESS$ fashion, i.e.
	// just for annotating or something.
	c.BindEnv("data-path")
	c.BindEnv("kwg-path-prefix")

	c.SetDefault("montecarlo-plies", 2)
	c.SetDefault("ttable-mem-fraction", 0.25)

	return nil
}
