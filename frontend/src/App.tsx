import { useState } from "react";
import { Config } from "../wailsjs/go/main/App";
import "@mantine/core/styles.css";
import { AppShell, Burger, Group, Skeleton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { Button, createTheme, MantineProvider, TextInput } from "@mantine/core";
import Board from "./board/board";
import { main } from "../wailsjs/go/models";
import BoardScene from "./board/board_scene";

const theme = createTheme({
  fontFamily: "Open Sans, sans-serif",
  primaryColor: "cyan",
});

function App() {
  const [resultText, setResultText] = useState(
    "Please enter your name below 👇"
  );
  const [config, setConfig] = useState<main.Config>();
  const [opened, { toggle }] = useDisclosure();
  const [is2D, setIs2D] = useState(true);
  Config().then((cfg) => setConfig(cfg));

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
            Navbar
            {Array(15)
              .fill(0)
              .map((_, index) => (
                <Skeleton key={index} h={28} mt="sm" animate={false} />
              ))}
          </AppShell.Navbar>
          <AppShell.Main>
            {/* <Board rows={15} cols={15}></Board> */}
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
