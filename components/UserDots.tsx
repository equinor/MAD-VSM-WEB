import { UserDot } from "./UserDot";
import React from "react";
import styles from "./UserDots.module.scss";

export function UserDots(props: { users: Array<string> }): JSX.Element {
  return (
    <div className={styles.container}>
      {props.users?.map((name) => (
        <UserDot key={name} name={name} />
      ))}
    </div>
  );
}
