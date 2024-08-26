import { useEffect, useState } from "react";
import { ActiveGame, Config } from "../wailsjs/go/main/App";
import "@mantine/core/styles.css";
import { AppShell, Burger, Group, NavLink, Skeleton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { Button, createTheme, MantineProvider, TextInput } from "@mantine/core";
import { ipc } from "../wailsjs/go/models";
import BoardScene from "./board/three/board_scene";
import { NewGameAction } from "./newgame";
import { SettingsAction } from "./settings";

const theme = createTheme({
  fontFamily: "Open Sans, sans-serif",
  primaryColor: "cyan",
});

function App() {
  const [config, setConfig] = useState<{ [key: string]: any }>();
  const [activeGame, setActiveGame] = useState<ipc.GameDocument>();
  const [opened, { toggle }] = useDisclosure();
  const [is2D, setIs2D] = useState(true);

  useEffect(() => {
    Config().then((cfg) => {
      console.log("settin cfg", cfg);
      setConfig(cfg);
    });

    ActiveGame().then((ag) => setActiveGame(ag));
  }, []);
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <div id="App">
        <AppShell
          header={{ height: 60 }}
          footer={{ height: 60 }}
          navbar={{
            width: 300,
            breakpoint: "sm",
            collapsed: { mobile: !opened },
          }}
          aside={{
            width: 300,
            breakpoint: "md",
            collapsed: { desktop: false, mobile: true },
          }}
          padding="md"
        >
          <AppShell.Header>
            <Group h="100%" px="md">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <Button onClick={() => setIs2D((p) => !p)}>Toggle 3D</Button>
            </Group>
          </AppShell.Header>
          <AppShell.Navbar p="md">
            <NewGameAction />
            <SettingsAction config={config} />
          </AppShell.Navbar>
          <AppShell.Main>
            <BoardScene is2D={is2D} />
          </AppShell.Main>
          <AppShell.Aside p="md">Aside</AppShell.Aside>
          <AppShell.Footer p="md">Footer</AppShell.Footer>
        </AppShell>
      </div>
    </MantineProvider>
  );
}

export default App;
