import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { HistoricalInspector } from "./HistoricalInspector";

const historicalDataClient = new QueryClient()

export const App = () => (
  <QueryClientProvider client={historicalDataClient}>
    <Container>
      <HistoricalDataCard />
    </Container>
  </QueryClientProvider>
);

export const HistoricalDataCard = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["chart-main"],
    queryFn: () =>
      fetch("/historical-data.json").then((res) =>
        res.json()
      )
  });

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <h1 className="display-1">GitHub's Historic Uptime</h1>
        <p>
          All data sourced from <a target="_blank" href="https://www.githubstatus.com/uptime">GitHub's historical uptime page</a>.
        </p>
      </div>

      <Card style={{ margin: "1rem 0" }}>
        <Card.Body>


          { isPending ?
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
              <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          : error ?
            <>
              <h3>Failed to Load Historical Data</h3>
              <p>Error:</p>
              <pre>{JSON.stringify(error)}</pre>
            </>
          :
            <HistoricalInspector data={data} />
          }
        </Card.Body>
      </Card>

      <p style={{ textAlign: "center", justifySelf: "flex-end" }}>
        <i><a href="https://github.com/DaMrNelson/github-historical-uptime" style={{ color: "var(--bs-secondary)" }}>View source</a></i>
      </p>
    </>
  );
};

export default App;
