import express, { Application } from "express";
import cors from "cors";
import router from "./routes/routes";
import env from "./utils/env";
import errorHandler from "./common/middlewares/errorHandler";
import { NotFoundErr } from "./common/exception/notFound-err";
import AuthErrorCode from "./common/constant/authErrorCode";
import dbConnect from "./database/dbConnect";
class App {
  app: Application;

  constructor() {
    this.app = express();
    this.middleware();
    this.routes();
    this.errorHandle();
  }

  private middleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes() {
    this.app.use("/api/auth", router);
    this.app.use("*", ()=>{
      throw new NotFoundErr({errorCode: AuthErrorCode.NOT_FOUND, errorMessage: "Not Found"});
    })
  }

  private errorHandle() {
    this.app.use(errorHandler);
  }

  public async listen() {
    const PORT = env.portServer;
    const HOST = env.getHost;
    dbConnect.connect();
    this.app.listen(PORT, () => {
      console.log(`Server running at port ${HOST}:${PORT}`);
    });
  }
}
export default new App();
