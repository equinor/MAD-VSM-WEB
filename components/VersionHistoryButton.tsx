import { ButtonWrapper } from "./ButtonWrapper";
import { timeline } from "@equinor/eds-icons";
import React from "react";

export const VersionHistoryButton = (props: {
  handleVersionHistoryClick: () => void;
}): JSX.Element => (
  <ButtonWrapper
    icon={timeline}
    title={"Show version history"}
    onClick={props.handleVersionHistoryClick}
  />
);
