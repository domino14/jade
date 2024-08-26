import { Modal, NavLink } from "@mantine/core";
import { SelectDataDirectory } from "../wailsjs/go/main/App";

import { useDisclosure } from "@mantine/hooks";
import { IconDiamondFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Config } from "../wailsjs/go/main/App";

type SAProps = {
  config?: { [key: string]: any };
};

export const SettingsAction = (props: SAProps) => {
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  // props.config.get("data-path")
  const [opened, { open, close, toggle }] = useDisclosure();

  const openDirectoryDialog = async () => {
    try {
      const path: string = await SelectDataDirectory();
      if (path) {
        setDirectoryPath(path);
      }
    } catch (err) {
      console.error("Error selecting directory:", err);
    }
  };

  useEffect(() => {
    if (props.config && "data-path" in props.config) {
      setDirectoryPath(props.config["data-path"] as string);
    }
  }, [props.config]);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Jade Settings">
        {directoryPath ? (
          <p>Selected Data Directory: {directoryPath}</p>
        ) : (
          <p>
            No data directory selected. Please select a data directory on your
            machine to continue. You can use Macondo's data directory if you
            have Macondo installed, for example.
          </p>
        )}
        <button onClick={openDirectoryDialog}>Select Data Directory</button>
      </Modal>

      <NavLink
        label="Settings"
        leftSection={<IconDiamondFilled size="1rem" stroke={1.5} />}
        onClick={open}
      />
    </>
  );
};
