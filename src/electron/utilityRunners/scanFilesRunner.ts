import { LibrarySetupService } from "../services/system/librarySetupService";
import { PropertiesUtil } from "../../core/util/propertiesUtil";

PropertiesUtil.initProps()
const librarySource = process.argv[2];
const librarySetupService = new LibrarySetupService(librarySource, process.env.DB_PATH);
librarySetupService.scanFiles();