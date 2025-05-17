import createOrRestartEmailWorker from "../service/emailWorker";

export async function startWorker() {
  await createOrRestartEmailWorker();
}

startWorker();