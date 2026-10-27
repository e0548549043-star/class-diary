import { createBrowserRouter, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import ClassDiaryPage from "../pages/ClassDiaryPage";
import ClassStudentsPage from "../pages/ClassStudentsPage";
import TeachersPage from "../pages/TeachersPage";
import MyLessonsPage from "../pages/MyLessonsPage";
import LessonFormPage from "../pages/LessonFormPage";
import Layout from "../components/Layout";
import ProtectedRout from "./ProtectedRout";
import ClassesPage from "../pages/ClassesPage";



export const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    {
        element: <Layout />,
        children: [
            {
                path: '/admin',
                element:<ProtectedRout role={'ADMIN'}/>,
                children: [
                    { index: true, element: <Navigate to="classes" replace /> },
                    { path: 'classes', element: <ClassesPage basePath="/admin/classes"/> },
                    { path: 'classes/:classId', element: <ClassDiaryPage /> },
                    { path: 'classes/:classId/students', element: <ClassStudentsPage /> },
                    { path: 'teachers', element: <TeachersPage /> },
                ],
            },

            {
                path: '/teacher',
                element:<ProtectedRout role={'TEACHER'}/>,
                children: [
                    { index: true, element: <Navigate to="classes" replace /> },
                    { path: 'classes', element: <ClassesPage basePath="/teacher/classes"/> },

                    { path: 'classes/:classId', element: <MyLessonsPage /> },
                    { path: 'classes/:classId/lessons/new', element: <LessonFormPage /> },
                    { path: 'lessons/:lessonId', element: <LessonFormPage /> },
                ],
            }
        ]
    }
    ,

    { path: '/', element: <Navigate to="/login" replace /> },
    { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router