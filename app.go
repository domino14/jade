package main

import (
	"context"
	"errors"
	"fmt"

	"github.com/rs/zerolog/log"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/woogles-io/liwords/pkg/cwgame"
	"github.com/woogles-io/liwords/rpc/api/proto/ipc"
)

// App struct
type App struct {
	ctx    context.Context
	config *Config

	activeCWGame *ipc.GameDocument
}

// NewApp creates a new App application struct
func NewApp(cfg *Config) *App {
	return &App{config: cfg}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) Config() map[string]any {
	fmt.Println("getting Config", a.config.AllSettings())
	return a.config.AllSettings()
}

func (a *App) ActiveGame() *ipc.GameDocument {
	return a.activeCWGame
}

func (a *App) NewGame(lexicon, boardLayoutName, letterDistributionName string,
	challengeRuleName string, player1, player2 string) (*ipc.GameDocument, error) {

	players := []*ipc.GameDocument_MinimalPlayerInfo{
		{Nickname: player1, RealName: player1, UserId: "internal-" + player1},
		{Nickname: player2, RealName: player2, UserId: "internal-" + player2},
	}

	cv, ok := ipc.ChallengeRule_value["ChallengeRule_"+challengeRuleName]
	if !ok {
		return nil, errors.New("no challenge rule found with name " + challengeRuleName)
	}

	// Create an untimed game.
	cwgameRules := cwgame.NewBasicGameRules(
		lexicon, boardLayoutName, letterDistributionName,
		ipc.ChallengeRule(cv), cwgame.Variant("classic"), []int{0, 0}, 0, 0, true,
	)

	gdoc, err := cwgame.NewGame(a.config.WGLConfig(), cwgameRules, players)
	return gdoc, err
}

func (a *App) SelectDataDirectory() (string, error) {
	dd, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Data Directory",
	})
	if err != nil {
		return "", err
	}

	// Write data directory to config.
	a.config.Set("data-path", dd)
	err = a.config.Write()
	if err != nil {
		log.Err(err).Msg("unable-to-write-config")
	} else {
		log.Info().Str("path", dd).Msg("wrote-data-path-to-configs")
	}

	return dd, nil
}
