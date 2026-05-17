import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface StaffNote {
  id: string;
  local_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const getStorageKey = (local_id: string) => `@staff_notes_${local_id}`;

export const getNotes = async (local_id: string): Promise<StaffNote[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(getStorageKey(local_id));
    if (jsonValue != null) {
      const notes = JSON.parse(jsonValue) as StaffNote[];
      // Sort by updated_at descending
      return notes.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    return [];
  } catch (e) {
    console.error("Error fetching notes", e);
    return [];
  }
};

export const getNoteById = async (local_id: string, note_id: string): Promise<StaffNote | null> => {
  try {
    const notes = await getNotes(local_id);
    return notes.find(n => n.id === note_id) || null;
  } catch (e) {
    console.error("Error fetching note", e);
    return null;
  }
};

export const createNote = async (local_id: string, title: string, content: string = ""): Promise<StaffNote | null> => {
  try {
    const notes = await getNotes(local_id);
    const now = new Date().toISOString();
    
    const newNote: StaffNote = {
      id: Crypto.randomUUID(),
      local_id,
      title,
      content,
      created_at: now,
      updated_at: now,
    };
    
    const newNotes = [newNote, ...notes];
    await AsyncStorage.setItem(getStorageKey(local_id), JSON.stringify(newNotes));
    return newNote;
  } catch (e) {
    console.error("Error creating note", e);
    return null;
  }
};

export const updateNote = async (local_id: string, note_id: string, content: string, title?: string): Promise<StaffNote | null> => {
  try {
    const notes = await getNotes(local_id);
    const noteIndex = notes.findIndex(n => n.id === note_id);
    
    if (noteIndex === -1) return null;
    
    const updatedNote = {
      ...notes[noteIndex],
      content,
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      updatedNote.title = title;
    }
    
    notes[noteIndex] = updatedNote;
    
    await AsyncStorage.setItem(getStorageKey(local_id), JSON.stringify(notes));
    return updatedNote;
  } catch (e) {
    console.error("Error updating note", e);
    return null;
  }
};

export const deleteNote = async (local_id: string, note_id: string): Promise<boolean> => {
  try {
    const notes = await getNotes(local_id);
    const newNotes = notes.filter(n => n.id !== note_id);
    await AsyncStorage.setItem(getStorageKey(local_id), JSON.stringify(newNotes));
    return true;
  } catch (e) {
    console.error("Error deleting note", e);
    return false;
  }
};
