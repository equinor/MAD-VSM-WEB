import useLocalStorage from "../hooks/useLocalStorage";
import { InfoBox } from "./InfoBox";
import Image from "next/image";
import React from "react";

export function CategoryHelpers() {
  const [showDragHelper, setShowDragHelper] = useLocalStorage(
    "showDragHelper",
    true
  );
  const [showCategoryClickHelper, setShowCategoryClickHelper] = useLocalStorage(
    "showCategoryClickHelper",
    true
  );
  return (
    <div style={{ width: 300 }}>
      {showDragHelper && (
        <InfoBox onClose={() => setShowDragHelper(false)}>
          <Image
            src={"/gifs/categoryDrag.gif"}
            alt="Animation of dragging a category onto a Problem-card"
            unoptimized={true} //Trouble with optimizing gifs
            width={800}
            height={321}
            // layout={"fill"}
          />
          <p>
            Drag a category into one or more of the problems, ideas or
            questions.
          </p>
        </InfoBox>
      )}
      {showCategoryClickHelper && (
        <InfoBox onClose={() => setShowCategoryClickHelper(false)}>
          <p>Click on a category to focus on it</p>
        </InfoBox>
      )}
    </div>
  );
}
