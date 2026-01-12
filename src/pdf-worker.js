import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";

GlobalWorkerOptions.workerSrc = workerSrc;
