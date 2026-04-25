import { EditorBridge, useBridgeState } from "@10play/tentap-editor";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import { forwardRef, useCallback, useState, useImperativeHandle } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { UploadableFile } from "@/interface/global.dto";
import { pickMedia } from "@/utils/media";

export interface EditorToolbarRef {
  handleAddImage: () => Promise<void>;
}

interface Props {
  editor: EditorBridge;
  images: UploadableFile[];
  video: UploadableFile | null;

  setImages: React.Dispatch<React.SetStateAction<UploadableFile[]>>;
  setVideo: React.Dispatch<React.SetStateAction<UploadableFile | null>>;
}

const EditorToolbar = forwardRef<EditorToolbarRef, Props>(
  ({ editor, images, video, setImages, setVideo }, ref) => {
    const [openTypo, setOpenTypo] = useState(false);

    const editorState = useBridgeState(editor);

    const isBold = editorState.isBoldActive;
    const isStrike = editorState.isStrikeActive;
    const isUnderline = editorState.isUnderlineActive;

    const isHeading = editorState.headingLevel === 3;

    const isBulletList = editorState.isBulletListActive;
    const isOrderedList = editorState.isOrderedListActive;
    const isLink = editorState.isLinkActive;

    const toggleBold = useCallback(() => editor.toggleBold(), [editor]);
    const toggleStrike = useCallback(() => editor.toggleStrike(), [editor]);

    const toggleHeading = useCallback(() => editor.toggleHeading(3), [editor]);
    const toggleUnderline = useCallback(
      () => editor.toggleUnderline(),
      [editor],
    );
    const toggleBulletList = useCallback(
      () => editor.toggleBulletList(),
      [editor],
    );
    const toggleOrderedList = useCallback(
      () => editor.toggleOrderedList(),
      [editor],
    );
    const toggleLink = useCallback(() => {
      editor.setLink("https://ejemplo.com");
    }, [editor]);

    const size = 22;

    const handleAddImage = async () => {
      // TODO: Toast
      if (images.length > 10) {
        return;
      }

      const valid = await pickMedia({
        mediaType: "Images",
        allowsMultipleSelection: true,
        allowsEditing: true,
        selectionLimit: 10,
      });

      setImages(valid);
    };

    const handleAddVideo = async () => {
      // TODO: Toast
      if (video !== null) {
        return;
      }

      const valid = await pickMedia({
        mediaType: "Videos",
        allowsMultipleSelection: false,
        allowsEditing: false,
        selectionLimit: 1,
      });

      setVideo(valid[0]);
    };

    useImperativeHandle(ref, () => ({
      handleAddImage,
    }));

    return (
      <KeyboardAvoidingView behavior={"padding"}>
        <ScrollView
          horizontal
          contentContainerClassName="items-center gap-x-4 py-3.5 px-8"
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled={true}
        >
          <TouchableOpacity
            onPress={() => setOpenTypo(!openTypo)}
            className={`p-1.5`}
          >
            <MaterialCommunityIcons
              name="format-letter-case"
              size={26}
              color="#4A4947"
            />
          </TouchableOpacity>

          {openTypo && (
            <View
              style={{ width: 1, height: 26, backgroundColor: "#878787" }}
            />
          )}

          {openTypo && (
            <>
              <TouchableOpacity
                onPress={toggleBold}
                disabled={isHeading}
                className={`p-1.5 rounded-full ${isBold ? "bg-bg-gray" : ""}`}
              >
                <MaterialIcons
                  name="format-bold"
                  size={size}
                  color={isBold ? "#e5a657" : isHeading ? "#dbdbdb" : "#4A4947"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleStrike}
                disabled={isHeading}
                className={`p-1.5 rounded-full ${isStrike ? "bg-bg-gray" : ""}`}
              >
                <MaterialIcons
                  name="format-strikethrough"
                  size={size}
                  color={
                    isStrike ? "#e5a657" : isHeading ? "#dbdbdb" : "#4A4947"
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleUnderline}
                disabled={isHeading}
                className="p-1.5 rounded-full"
              >
                <MaterialIcons
                  name="format-underline"
                  size={size}
                  color={
                    isUnderline ? "#e5a657" : isHeading ? "#dbdbdb" : "#4A4947"
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleHeading}
                className="p-1.5 rounded-full"
              >
                <MaterialIcons
                  name="format-size"
                  size={size}
                  color={isHeading ? "#e5a657" : "#4A4947"}
                />
              </TouchableOpacity>

              <View
                style={{ width: 1, height: 26, backgroundColor: "#878787" }}
              />
            </>
          )}

          {/* BOTÓN DE ENLACE */}
          <TouchableOpacity onPress={toggleLink} className="p-1.5 rounded-full">
            <MaterialIcons
              name="link"
              size={size}
              color={isLink ? "#e5a657" : "#4A4947"}
            />
          </TouchableOpacity>

          {/* BOTÓN DE IMAGEN */}
          <TouchableOpacity
            onPress={handleAddImage}
            className="p-1.5 rounded-full"
            disabled={images.length > 0 || video !== null}
          >
            <Ionicons
              name="image-outline"
              size={22}
              color={
                images.length > 0 || video !== null ? "#dbdbdb" : "#4A4947"
              }
            />
          </TouchableOpacity>

          {/* BOTÓN DE VIDEO */}
          <TouchableOpacity
            onPress={handleAddVideo}
            className="p-1.5 rounded-full"
            disabled={images.length > 0 || video !== null}
          >
            <Octicons
              name="video"
              size={20}
              color={
                images.length > 0 || video !== null ? "#dbdbdb" : "#4A4947"
              }
            />
          </TouchableOpacity>

          {/* BOTÓN DE LISTA DE VIÑETAS */}
          <TouchableOpacity
            onPress={toggleBulletList}
            className="p-1.5 rounded-full"
          >
            <MaterialIcons
              name="format-list-bulleted"
              size={size}
              color={isBulletList ? "#e5a657" : "#4A4947"}
            />
          </TouchableOpacity>

          {/* BOTÓN DE LISTA NUMERADA */}
          <TouchableOpacity
            onPress={toggleOrderedList}
            className="p-1.5 rounded-full"
          >
            <MaterialIcons
              name="format-list-numbered"
              size={size}
              color={isOrderedList ? "#e5a657" : "#4A4947"}
            />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  },
);

EditorToolbar.displayName = "EditorToolbar";

export default EditorToolbar;
