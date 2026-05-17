import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalSearchParams, useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getNotes, createNote, deleteNote, StaffNote } from "@/services/notes.service";

export default function StaffNotesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { local_id } = useGlobalSearchParams();
  const localIdStr = local_id as string;

  const [notes, setNotes] = useState<StaffNote[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    const fetchedNotes = await getNotes(localIdStr);
    setNotes(fetchedNotes);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [localIdStr])
  );

  const handleCreateNote = async () => {
    let finalTitle = newTitle.trim();

    // Auto-nombra si está vacío
    if (!finalTitle) {
      let counter = 1;
      let titleExists = true;
      while (titleExists) {
        finalTitle = `Nota ${counter}`;
        // eslint-disable-next-line no-loop-func
        titleExists = notes.some(n => n.title === finalTitle);
        if (titleExists) counter++;
      }
    }

    const createdNote = await createNote(localIdStr, finalTitle, "");
    setModalVisible(false);
    setNewTitle("");

    if (createdNote) {
      router.push({ pathname: "/(staff)/note/[note_id]" as any, params: { note_id: createdNote.id, local_id: localIdStr } });
    } else {
      Alert.alert("Error", "No se pudo crear la nota.");
    }
  };

  const confirmDelete = (note_id: string, title: string) => {
    setNoteToDelete({ id: note_id, title });
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    if (noteToDelete) {
      await deleteNote(localIdStr, noteToDelete.id);
      setDeleteModalVisible(false);
      setNoteToDelete(null);
      fetchNotes();
    }
  };

  const renderNote = ({ item }: { item: StaffNote }) => {
    const date = new Date(item.updated_at);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

    let contentPreview = item.content.replace(/<[^>]+>/g, '').trim();
    if (contentPreview) {
      contentPreview = contentPreview.split(/\s+/)[0] + '...';
    }

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl mb-4 p-5 shadow-sm border border-gray-100 flex-row items-center"
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: "/(staff)/note/[note_id]" as any, params: { note_id: item.id, local_id: localIdStr } })}
      >
        <View className="flex-1">
          <Text className="text-[18px] font-dosis-bold text-text-3 mb-1">{item.title}</Text>
          <Text className="text-[14px] font-dosis-medium text-text-5 mb-2" numberOfLines={1}>
            {contentPreview || "Sin contenido..."}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text className="text-[12px] font-dosis-medium text-text-6 ml-1">{formattedDate}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="w-10 h-10 items-center justify-center bg-red-50 rounded-full ml-3"
          onPress={() => confirmDelete(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={18} color="#B53325" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-gray">
      {/* HEADER */}
      <View className="px-6 pt-6 pb-6 bg-white border-b border-gray-100 shadow-sm z-10 flex-row items-center justify-between">
        <View>
          <Text className="text-[28px] font-dosis-bold text-text-3">Bloc de Notas</Text>
          <Text className="text-[15px] font-dosis-medium text-text-5">
            Anotaciones rápidas.
          </Text>
        </View>
        <View className="w-12 h-12 bg-yellow-50 rounded-full items-center justify-center">
          <Ionicons name="document-text" size={24} color="#e5a657" />
        </View>
      </View>

      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={renderNote}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? (
          <View className="items-center justify-center mt-20 px-6">
            <View className="w-24 h-24 bg-gray-200 rounded-full justify-center items-center mb-6">
              <Ionicons name="create-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-[20px] font-dosis-bold text-text-3 text-center mb-2">
              No hay notas
            </Text>
            <Text className="text-[15px] font-dosis-medium text-text-5 text-center">
              Presiona el botón "+" abajo para crear tu primera nota.
            </Text>
          </View>
        ) : null}
      />

      {/* FAB BUTTON */}
      <TouchableOpacity
        className="absolute w-16 h-16 bg-white rounded-full items-center justify-center shadow-md border border-gray-100"
        style={{ bottom: insets.bottom + 20, right: 24, elevation: 4 }}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#1F2937" />
      </TouchableOpacity>

      {/* NEW NOTE MODAL */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center items-center bg-black/50 px-6"
        >
          <View className="bg-white w-full rounded-3xl p-6 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[20px] font-dosis-bold text-text-3">Nueva Nota</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text className="text-[14px] font-dosis-medium text-text-5 mb-2">
              Ingresa un título para la nota (opcional):
            </Text>

            <TextInput
              className="bg-bg-gray border border-gray-200 rounded-xl px-4 py-3 font-dosis-semibold text-[16px] text-text-3 mb-6"
              placeholder="Ej: Compras pendientes"
              placeholderTextColor="#9CA3AF"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus={true}
            />

            <TouchableOpacity
              className="bg-bg-blue py-3 rounded-xl items-center"
              onPress={handleCreateNote}
            >
              <Text className="text-white font-dosis-bold text-[16px]">Crear y Editar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white w-full rounded-3xl p-6 shadow-lg items-center">
            <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="trash" size={32} color="#B53325" />
            </View>
            
            <Text className="text-[22px] font-dosis-bold text-text-3 text-center mb-2">
              Eliminar Nota
            </Text>
            
            <Text className="text-[15px] font-dosis-medium text-text-5 text-center mb-6">
              ¿Estás seguro de que deseas eliminar la nota "{noteToDelete?.title}"? Esta acción no se puede deshacer.
            </Text>
            
            <View className="flex-row w-full gap-x-4">
              <TouchableOpacity 
                className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text className="text-text-4 font-dosis-bold text-[16px]">Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-[#B53325] py-3 rounded-xl items-center"
                onPress={executeDelete}
              >
                <Text className="text-white font-dosis-bold text-[16px]">Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
