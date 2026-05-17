import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getNoteById, updateNote, StaffNote } from "@/services/notes.service";

import {
  RichText,
  useEditorBridge,
  TenTapStartKit,
  PlaceholderBridge,
} from "@10play/tentap-editor";

export default function NoteEditorScreen() {
  const { local_id, note_id } = useGlobalSearchParams();
  const [note, setNote] = useState<StaffNote | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      const fetchedNote = await getNoteById(local_id as string, note_id as string);
      if (fetchedNote) {
        setNote(fetchedNote);
      }
    };
    fetchNote();
  }, [local_id, note_id]);

  if (!note) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3578e4" />
      </View>
    );
  }

  return <EditorContent note={note} local_id={local_id as string} note_id={note_id as string} />;
}

function EditorContent({ note, local_id, note_id }: { note: StaffNote; local_id: string; note_id: string }) {
  const router = useRouter();

  const customCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Dosis:wght@400;500;600;700&display=swap');

  p {
    font-family: 'Dosis', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 18px;
    color: #2F2F2F;
    line-height: 1.5;
    margin-top: 0;
  }

  .ProseMirror p.is-empty:first-child::before {
    content: attr(data-placeholder);
    color: #9CA3AF; 
    font-size: 18px;
    font-family: 'Dosis', sans-serif;
    pointer-events: none;
    height: 0;
    float: left;
  }

  ul, ol {
    padding-left: 20px;
  }
  `;

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: note.content,
    bridgeExtensions: [
      ...TenTapStartKit,
      PlaceholderBridge.configureExtension({
        placeholder: "Empieza a escribir tu nota aquí...",
      }),
    ],
  });

  useEffect(() => {
    if (editor.getEditorState().isReady) {
      editor.injectCSS(customCSS);
    }
  }, [editor.getEditorState().isReady, editor, customCSS]);

  const handleSave = async () => {
    const content = await editor.getHTML();
    await updateNote(local_id, note_id, content);
    router.back();
  };

  // Funciones de formato
  const isBold = editor.getEditorState().isBoldActive;
  const isItalic = editor.getEditorState().isItalicActive;
  const isUnderline = editor.getEditorState().isUnderlineActive;
  const isBulletList = editor.getEditorState().isBulletListActive;
  const isOrderedList = editor.getEditorState().isOrderedListActive;

  const toggleBold = useCallback(() => editor.toggleBold(), [editor]);
  const toggleItalic = useCallback(() => editor.toggleItalic(), [editor]);
  const toggleUnderline = useCallback(() => editor.toggleUnderline(), [editor]);
  const toggleBulletList = useCallback(() => editor.toggleBulletList(), [editor]);
  const toggleOrderedList = useCallback(() => editor.toggleOrderedList(), [editor]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full"
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Text className="font-dosis-bold text-center text-[18px] text-text-3 flex-1" numberOfLines={1}>
          {note.title}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          className="bg-bg-blue py-2 px-4 rounded-full"
        >
          <Text className="font-dosis-bold text-[14px] text-white">Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* TOOLBAR SUPERIOR */}
      <View className="border-b border-gray-100 bg-gray-50 px-2 py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{ gap: 8, alignItems: "center" }}>
          <TouchableOpacity onPress={toggleBold} className={`w-10 h-10 items-center justify-center rounded-full ${isBold ? "bg-bg-blue" : "bg-white border border-gray-200"}`}>
            <MaterialIcons name="format-bold" size={22} color={isBold ? "white" : "#4B5563"} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleItalic} className={`w-10 h-10 items-center justify-center rounded-full ${isItalic ? "bg-bg-blue" : "bg-white border border-gray-200"}`}>
            <MaterialIcons name="format-italic" size={22} color={isItalic ? "white" : "#4B5563"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleUnderline} className={`w-10 h-10 items-center justify-center rounded-full ${isUnderline ? "bg-bg-blue" : "bg-white border border-gray-200"}`}>
            <MaterialIcons name="format-underline" size={22} color={isUnderline ? "white" : "#4B5563"} />
          </TouchableOpacity>

          <View className="w-[1px] h-6 bg-gray-300 mx-1" />

          <TouchableOpacity onPress={toggleBulletList} className={`w-10 h-10 items-center justify-center rounded-full ${isBulletList ? "bg-bg-blue" : "bg-white border border-gray-200"}`}>
            <MaterialIcons name="format-list-bulleted" size={22} color={isBulletList ? "white" : "#4B5563"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleOrderedList} className={`w-10 h-10 items-center justify-center rounded-full ${isOrderedList ? "bg-bg-blue" : "bg-white border border-gray-200"}`}>
            <MaterialIcons name="format-list-numbered" size={22} color={isOrderedList ? "white" : "#4B5563"} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* EDITOR */}
      <View className="flex-1 px-4 pt-4">
        <RichText style={styles.richText} editor={editor} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  richText: {
    flex: 1,
    backgroundColor: "transparent",
  }
});
