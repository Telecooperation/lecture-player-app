export class LectureRecording {
    id?: string;
    name: string;
    description?: string;
    date: string;
    duration?: number;

    fileName: string;
    presenterFileName?: string;
    stageVideo?: string;

    fileNameHd?: string;
    presenterFileNameHd?: string;
    stageVideoHd?: string;

    vtt?: string;

    processing: boolean;
    active: boolean;
    disabled: boolean;

    slides?: any[];
    ocr?: string;

    week?: string;
}
