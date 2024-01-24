import { Button, Chip, Icon, Search } from "@equinor/eds-core-react";
import { useState } from "react";

import { close } from "@equinor/eds-icons";
import { debounce } from "utils/debounce";
import { getLabels } from "services/labelsApi";
import { getUpdatedLabel } from "utils/getUpdatedLabel";
import styles from "./FilterLabelBox.module.scss";
import { unknownErrorToString } from "utils/isError";
import { useQuery } from "react-query";
import { useRouter } from "next/router";

export function FilterLabelBox(props: {
  handleClose: () => void;
}): JSX.Element {
  const [searchText, setSearchText] = useState("");
  const {
    data: labels,
    isLoading,
    error,
  } = useQuery(["labels", searchText], () => getLabels(searchText));

  return (
    <div className={styles.box}>
      <TopSection handleClose={props.handleClose} />
      <SearchSection setSearchText={setSearchText} />
      <LabelSection labels={labels} isLoading={isLoading} error={error} />
    </div>
  );
}

function TopSection(props: { handleClose: () => void }): JSX.Element {
  return (
    <div className={styles.topSection}>
      <p className={styles.heading}>Filter by label</p>
      <Button variant={"ghost_icon"} onClick={props.handleClose}>
        <Icon data={close} />
      </Button>
    </div>
  );
}

function SearchSection(props: {
  setSearchText: (searchText: string) => void;
}): JSX.Element {
  const { setSearchText } = props;
  const router = useRouter();

  return (
    <div className={styles.searchSection}>
      <Search
        aria-label="search"
        placeholder="Search labels"
        autoComplete="off"
        className={styles.searchBar}
        onChange={(e) => {
          debounce(
            () => setSearchText(`${e.target.value}`),
            500,
            "labelSearch"
          );
        }}
      />
      <Button
        color="primary"
        variant="ghost"
        onClick={() =>
          router.replace({
            query: { ...router.query, rl: [] },
          })
        }
        style={{ minWidth: "90px" }}
      >
        Clear all
      </Button>
    </div>
  );
}

function LabelSection(props: { labels; isLoading; error }): JSX.Element {
  const { labels, isLoading, error } = props;
  const router = useRouter();

  // rl stands for "required label"
  const handleClick = (selectedLabelId: string) => {
    const labelIdArray = getUpdatedLabel(selectedLabelId, router.query.rl);
    router.replace({
      query: { ...router.query, rl: labelIdArray },
    });
  };

  const isActive = (id: string) => {
    if (router.query.rl) {
      return `${router.query.rl}`.split(",").some((element) => element == id);
    }
  };

  if (isLoading) {
    return <p>Loading labels...</p>;
  }

  if (error) {
    return <p>{unknownErrorToString(error)}</p>;
  }

  return (
    <div className={styles.labelSection}>
      <p className={styles.labelCounter}>
        {`${labels.length}`} {labels.length == 1 ? "label" : "labels"}{" "}
        discovered
      </p>

      <div className={styles.labelContainer}>
        {labels.map((label) => (
          <button
            key={label.id}
            onClick={() => handleClick(label.id.toString())}
            style={{ padding: "0", backgroundColor: "#ffffff", border: "none" }}
            className={styles.button}
          >
            <Chip
              variant={isActive(label.id.toString()) ? "active" : null}
              style={{ marginRight: "5px", marginBottom: "10px" }}
            >
              {label.text}
            </Chip>
          </button>
        ))}
      </div>
    </div>
  );
}
