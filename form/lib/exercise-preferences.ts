'use client';
import {createContext} from 'react';
export const ExerciseProfileContext=createContext<any[]>([]);

export const GymEquipmentContext=createContext<{id:string;name:string;equipment:string[]}[]>([]);
