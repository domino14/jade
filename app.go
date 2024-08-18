package main

import (
	"context"
	"fmt"

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

func (a *App) Config() *Config {
	return a.config
}

func (a *App) ActiveGame() *ipc.GameDocument {
	return a.activeCWGame
}

func (a *App) NewGame(lexicon, boardLayoutName, letterDistributionName string,
	challengeRule ipc.ChallengeRule, player1, player2 string) (*ipc.GameDocument, error) {

	players := []*ipc.GameDocument_MinimalPlayerInfo{
		{Nickname: player1, RealName: player1, UserId: "internal-" + player1},
		{Nickname: player2, RealName: player2, UserId: "internal-" + player2},
	}

	// Create an untimed game.
	cwgameRules := cwgame.NewBasicGameRules(
		lexicon, boardLayoutName, letterDistributionName,
		challengeRule, cwgame.Variant("classic"), []int{0, 0}, 0, 0, true,
	)

	gdoc, err := cwgame.NewGame(a.config.wglconfig, cwgameRules, players)
	return gdoc, err
}
