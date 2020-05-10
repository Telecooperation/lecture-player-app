export class Course {
    id: string;
    name: string;
    folder: string;
    semester: string;
    current: boolean;

    weekView?: boolean = false;
    url?: string;
    publishMode?: boolean = false;
}
