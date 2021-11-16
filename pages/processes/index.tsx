import React, { useState } from "react";
import commonStyles from "../../styles/common.module.scss";
import styles from "./FrontPage.module.scss";
import Head from "next/head";
import { Layouts } from "../../layouts/LayoutWrapper";
import SideNavBar from "components/SideNavBar";
import FrontPageBody from "components/FrontPageBody";
import { useQuery } from "react-query";
import { getProjects } from "../../services/projectApi";
import { useRouter } from "next/router";
import { Typography } from "@equinor/eds-core-react";
import { SortSelect } from "../../components/SortSelect";
import { SearchField } from "components/SearchField";

export default function AllProcesses(): JSX.Element {
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const router = useRouter();
  const { searchQuery, orderBy } = router?.query;

  const query = useQuery(["projects", page, searchQuery || "", orderBy], () =>
    getProjects({
      page,
      items: itemsPerPage,
      q: searchQuery ? `${searchQuery}` : "",
      orderBy: orderBy && `${orderBy}`,
    })
  );

  return (
    <div>
      <Head>
        <title>Flyt | All processes</title>
        <link rel={"icon"} href={"/favicon.ico"} />
      </Head>

      <main className={styles.main}>
        <SideNavBar />
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.subHeader}>
              <SearchField />
            </div>
            <div className={styles.subHeader}>
              <Typography variant="h3">All processes</Typography>
              <SortSelect />
            </div>
          </div>
          <FrontPageBody
            showNewProjectButton={true}
            itemsPerPage={itemsPerPage}
            query={query}
            onChangePage={(newPage) => setPage(newPage)}
          />
        </div>
      </main>
    </div>
  );
}

AllProcesses.layout = Layouts.Default;
AllProcesses.auth = true;
