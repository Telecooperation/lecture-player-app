export class LectureRecording {
    id?: string;
    name: string;
    date: string;

    fileName: string;
    presenterFileName?: string;
    stageVideo?: string;

    fileNameHd?: string;
    presenterFileNameHd?: string;
    stageVideoHd?: string;

    processing: boolean;
    active: boolean;
    disabled: boolean;

    slides?: any[];
    ocr?: string;
}
