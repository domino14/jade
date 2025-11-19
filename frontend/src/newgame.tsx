import {
  Button,
  Group,
  Modal,
  NativeSelect,
  NavLink,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import { alphabetFromName, UndefinedAlphabet } from "./constants/alphabets";
import { NewGame } from "../wailsjs/go/main/App";
import { GameDocument, GameDocumentSchema } from "./gen/api/proto/ipc/omgwords_pb";
import { fromBinary } from "@bufbuild/protobuf";

const ChallengeRules = ["FIVE_POINT", "TEN_POINT", "DOUBLE", "SINGLE"];

type NGProps = {
  setNewGame: (g: GameDocument) => void;
};

export const NewGameAction = (props: NGProps) => {
  const [opened, { open, close, toggle }] = useDisclosure();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      player1: "Player 1",
      player2: "Player 2",
      lexicon: "NWL23",
      alphabetName: "english",
      challengeRule: "DOUBLE",
    },

    validate: {
      alphabetName: (val) =>
        alphabetFromName(val) === UndefinedAlphabet
          ? "This alphabet is not currently supported"
          : null,
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={close} title="Create new game">
        <form
          onSubmit={form.onSubmit((values) => {
            NewGame(
              values.lexicon,
              "CrosswordGame",
              values.alphabetName,
              values.challengeRule,
              values.player1,
              values.player2
            ).then((ret: Array<number>) => {
              // Parse as protobuf!
              const doc = fromBinary(GameDocumentSchema, Uint8Array.from(ret));
              console.log("gdoc", doc);
              props.setNewGame(doc);
            });
          })}
        >
          <Stack align="stretch" justify="center" gap="md">
            <TextInput
              withAsterisk
              size="md"
              label="Player 1"
              placeholder=""
              key={form.key("player1")}
              {...form.getInputProps("player1")}
            />
            <TextInput
              withAsterisk
              size="md"
              label="Player 2"
              placeholder=""
              key={form.key("player2")}
              {...form.getInputProps("player2")}
            />
            <TextInput
              withAsterisk
              size="md"
              label="Lexicon"
              placeholder="NWL23"
              key={form.key("lexicon")}
              {...form.getInputProps("lexicon")}
            />
            <TextInput
              withAsterisk
              size="md"
              label="Alphabet"
              placeholder="english"
              key={form.key("alphabetName")}
              {...form.getInputProps("alphabetName")}
            />
            <NativeSelect
              label="Challenge Rule"
              size="md"
              data={ChallengeRules}
              key={form.key("challengeRule")}
              {...form.getInputProps("challengeRule")}
            />
            <Group justify="flex-end" mt="md">
              <Button type="submit">Submit</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <NavLink
        label="New game"
        leftSection={<IconCirclePlusFilled size="1rem" stroke={1.5} />}
        onClick={open}
      />
    </>
  );
};
