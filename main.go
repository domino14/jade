package main

import (
	"embed"
	"fmt"
	"os"
	"runtime"

	"github.com/rs/zerolog/log"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	cfg := &Config{}
	cfg.Load(os.Args[1:])
	log.Info().Msgf("Loaded config: %v", cfg)
	log.Info().Msgf("data_path: %s", cfg.GetString("data-path"))

	// Create an instance of the app structure
	app := NewApp(cfg)

	AppMenu := menu.NewMenu()
	FileMenu := AppMenu.AddSubmenu("File")
	FileMenu.AddText("New", keys.CmdOrCtrl("n"), app.startNewGame)
	FileMenu.AddText("Open", keys.CmdOrCtrl("o"), app.openFile)
	FileMenu.AddSeparator()
	FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		os.Exit(0)
	})

	if runtime.GOOS == "darwin" {
		AppMenu.Append(menu.EditMenu()) // on macos platform, we should append EditMenu to enable Cmd+C,Cmd+V,Cmd+Z... shortcut
	}
	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Jade",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
		Menu: AppMenu,
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

func (a *App) startNewGame(d *menu.CallbackData) {
	// XXX nothing
	gdoc, err := a.NewGame("NWL23", "CrosswordGame", "english", "DOUBLE", "Cesitar", "Luqui")
	if err != nil {
		println("Error starting new game:", err.Error())
	}
	a.activeCWGame = gdoc
}

func (a *App) openFile(d *menu.CallbackData) {
	f, err := wailsruntime.OpenFileDialog(a.ctx, wailsruntime.OpenDialogOptions{
		Title: "Select a *.gcg or *.gdoc file",
		Filters: []wailsruntime.FileFilter{
			{
				DisplayName: "Generic Crossword Game files (*.gcg)",
				Pattern:     "*.gcg",
			},
			{
				DisplayName: "Game Document files (*.gdoc)",
				Pattern:     "*.gdoc",
			},
		},
	})
	if err != nil {
		fmt.Println("error", err)
		return
	}
	fmt.Println("file", f)
}
