import { Typography, TypographyProps } from "@equinor/eds-core-react";
import styles from "../Node.module.scss";

export function FormatNodeText({
  children,
  ...typographyProps
}: TypographyProps) {
  if (!children) return null;
  const text = children.toString();
  // Pattern matching for Markdown hyperlink urls
  const pattern = /\[([^\]]+)]\(([^)]+)\)/g;
  const result = [];
  let lastIndex = 0;

  text.replace(pattern, (match, linkText, _, offset) => {
    if (lastIndex <= offset) {
      result.push(<>{text.slice(lastIndex, offset)}</>);
    }

    result.push(
      <Typography
        className={styles[typographyProps.className ?? ""]}
        style={{ cursor: "grab" }}
        link
      >
        {linkText}
      </Typography>
    );
    lastIndex = offset + match.length;
    return linkText;
  });

  if (lastIndex < text.length) {
    result.push(<>{text.slice(lastIndex)}</>);
  }

  return <Typography {...typographyProps}>{result}</Typography>;
}
