import styles from "./Node.module.scss";
import { formatNodeText } from "./utils/formatNodeText";
import { Typography } from "@equinor/eds-core-react";

type NodeDescription = {
  header?: string;
  description?: string;
};

export const NodeDescription = ({ header, description }: NodeDescription) => (
  <div className={styles["node__description-container"]}>
    {header && (
      <Typography variant="caption" className={styles.header}>
        {header}
      </Typography>
    )}
    {description && (
      <Typography variant="caption" className={`${styles.description}`}>
        {formatNodeText(description)}
      </Typography>
    )}
  </div>
);
