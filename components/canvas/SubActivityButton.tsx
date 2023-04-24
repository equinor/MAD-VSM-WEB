import React, { useState } from "react";
import styles from "./CardButtons.module.scss";
import { CardButton } from "./../../interfaces/CardButton";

export const SubActivityButton = (props: CardButton) => {
  const [hovering, setHovering] = useState(false);

  return (
    <div className={styles.cardButtonContainer}>
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`${styles.cardButton} ${
          styles["cardButton--subactivity"]
        }  ${
          (hovering || props.active) && styles["cardButton--subactivity--hover"]
        }`}
        onClick={() => props.onClick()}
        title="Sub Activity"
      />
    </div>
  );
};