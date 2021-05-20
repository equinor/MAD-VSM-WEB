import { useStoreDispatch, useStoreState } from "../../hooks/storeHooks";
import commonStyles from "../../styles/common.module.scss";
import Head from "next/head";
import { Typography } from "@equinor/eds-core-react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { Layouts } from "../../layouts/LayoutWrapper";
import { useStoreRehydrated } from "easy-peasy";
import { setUpSignalRConnection } from "../../services/setUpSignalRConnection";
import { signalRActionTypes } from "../../types/signalRActionTypes";

const DynamicComponentWithNoSSR = dynamic(
  () => import("../../components/VSMCanvas"),
  { ssr: false }
);

export default function Project() {
  const router = useRouter();
  const { id } = router.query;

  const error = useStoreState((state) => state.errorProject);
  const dispatch = useStoreDispatch();
  const project = useStoreState((state) => state.project);
  const rehydrated = useStoreRehydrated();
  useEffect(() => {
    if (id) {
      dispatch.fetchProject({ id });
      dispatch.setSelectedObject(null);

      if (typeof id === "string") {
        setUpSignalRConnection(parseInt(id)).then((connection) => {
          connection.on(signalRActionTypes.UpdateObject, (data) => {
            console.log("UpdateObject", data);
            dispatch.fetchProject({ id });
          });
          connection.on(signalRActionTypes.DeletedObject, (data) => {
            console.log("DeletedObject", data);
            dispatch.fetchProject({ id });
          });
          connection.on(signalRActionTypes.SaveProject, (data) => {
            console.log("SaveProject", data);
          });
          connection.on(signalRActionTypes.DeleteProject, (data) => {
            console.log("DeleteProject", data);
            alert(
              "This VSM was deleted. We will now navigate you back to the start-page"
            );
            router.push("/");
          });
        });
      }
    }
  }, [id]);

  if (!rehydrated) {
    //Ref: https://easy-peasy.now.sh/docs/api/use-store-rehydrated.html
    return (
      <div className={commonStyles.container}>
        <Head>
          <title>Flyt | Project {id}</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={commonStyles.main}>
          <Typography variant="h1">Hydrating...</Typography>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={commonStyles.container}>
        <Head>
          <title>Flyt | Project {id}</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={commonStyles.main}>
          <Typography variant="h1">{error.message}</Typography>
          <p>
            We have some troubles with this VSM. Please try to refresh the page.
          </p>
        </main>
      </div>
    );
  }
  return (
    <div className={commonStyles.container}>
      <Head>
        <title>{project?.name || `Flyt | Project ${id}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <DynamicComponentWithNoSSR />
      </main>
    </div>
  );
}

Project.layout = Layouts.Canvas;
Project.auth = true;
