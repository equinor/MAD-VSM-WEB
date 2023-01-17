import React, { useState } from "react";
import styles from "./CardButtons.module.css";

export const ChoiceButton = (props) => {
  const [hovering, setHovering] = useState(false);

  return (
    <div className={styles.cardButtonContainer}>
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`${styles.cardButton} ${styles["cardButton--choice"]}  ${
          (hovering || props.active) && styles["cardButton--choice--hover"]
        }`}
        onClick={() => props.onClick()}
        title="Choice"
      />
    </div>
  );
};
