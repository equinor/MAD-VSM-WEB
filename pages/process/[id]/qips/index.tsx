import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useRouter } from "next/router";
import Link from "next/link";
import { getTasksForProject } from "../../../../services/taskApi";
import { unknownErrorToString } from "../../../../utils/isError";
import { QipCard } from "../../../../components/QipCard";
import { Layouts } from "../../../../layouts/LayoutWrapper";
import { io } from "socket.io-client";

export default function QipsPage(): JSX.Element {
  const router = useRouter();
  const { id } = router.query;

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery(["tasks", id], () => getTasksForProject(id));

  const queryClient = useQueryClient();

  useEffect((): any => {
    // connect to socket server
    const socket = io(process.env.BASE_URL, {
      path: "/api/socketio",
    });
    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
    });

    socket.on(`room-${id}`, (message) => {
      console.log(`room-${id} | We got an update!`, message);
      queryClient.invalidateQueries(message?.queryKey);
    });

    // socket disconnect onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  if (error) {
    return <p>{unknownErrorToString(error)}</p>;
  }
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        padding: 12,
        justifyContent: "center",
      }}
    >
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        tasks
          ?.sort((a, b) => a.fkTaskType - b.fkTaskType)
          .map((task) => (
            <Link
              key={task.vsmTaskID}
              href={`/process/${id}/qips/${task.vsmTaskID}`}
            >
              <QipCard task={task} />
            </Link>
          ))
      )}
    </div>
  );
}

QipsPage.layout = Layouts.Default;
QipsPage.auth = true;
