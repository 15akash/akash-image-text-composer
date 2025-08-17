import { State, Action, TextLayer } from '@/types/textLayers';

export const initialState: State = {
  textLayers: [],
  selectedLayer: null,
  history: [[]],
  historyIndex: 0,
  uploadedImage: null,
  originalImageDimensions: null,
  needsFabricRecreation: false
};

export function textLayersReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TEXT_LAYER':
      const newLayers = [...state.textLayers, action.layer];
      return {
        ...state,
        textLayers: newLayers,
        selectedLayer: action.layer.id,
        history: [...state.history.slice(0, state.historyIndex + 1), newLayers],
        historyIndex: state.historyIndex + 1
      };

    case 'UPDATE_TEXT_LAYER':
      const updatedLayers = state.textLayers.map(layer => 
        layer.id === action.layerId ? { ...layer, ...action.updates } : layer
      );
      return {
        ...state,
        textLayers: updatedLayers,
        history: [...state.history.slice(0, state.historyIndex + 1), updatedLayers],
        historyIndex: state.historyIndex + 1
      };

    case 'UPDATE_TEXT_LAYER_IMMEDIATE':
      const immediateUpdatedLayers = state.textLayers.map(layer => 
        layer.id === action.layerId ? { ...layer, ...action.updates } : layer
      );
      return {
        ...state,
        textLayers: immediateUpdatedLayers
        // Note: No history update here - that will be handled by debounced function
      };

    case 'DELETE_TEXT_LAYER':
      const filteredLayers = state.textLayers.filter(layer => layer.id !== action.layerId);
      return {
        ...state,
        textLayers: filteredLayers,
        selectedLayer: state.selectedLayer === action.layerId ? null : state.selectedLayer,
        history: [...state.history.slice(0, state.historyIndex + 1), filteredLayers],
        historyIndex: state.historyIndex + 1
      };

    case 'SELECT_LAYER':
      return {
        ...state,
        selectedLayer: action.layerId
      };

    case 'CLEAR_LAYERS':
      return {
        ...state,
        textLayers: [],
        selectedLayer: null,
        history: [...state.history.slice(0, state.historyIndex + 1), []],
        historyIndex: state.historyIndex + 1
      };

    case 'SET_IMAGE':
      return {
        ...state,
        uploadedImage: action.imageUrl,
        originalImageDimensions: action.dimensions
      };

    case 'UNDO':
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          textLayers: state.history[newIndex],
          historyIndex: newIndex,
          selectedLayer: null,
          needsFabricRecreation: true
        };
      }
      return state;

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          textLayers: state.history[newIndex],
          historyIndex: newIndex,
          selectedLayer: null,
          needsFabricRecreation: true
        };
      }
      return state;

    case 'SAVE_TO_HISTORY':
      return {
        ...state,
        history: [...state.history.slice(0, state.historyIndex + 1), state.textLayers],
        historyIndex: state.historyIndex + 1
      };

    case 'RESTORE_PROJECT':
      return {
        ...state,
        textLayers: action.project.textLayers as TextLayer[],
        uploadedImage: action.project.uploadedImage,
        originalImageDimensions: action.project.originalImageDimensions,
        selectedLayer: null,
        history: [action.project.textLayers as TextLayer[]],
        historyIndex: 0
      };

    case 'RESET_PROJECT':
      return {
        ...initialState,
        history: [[]],
        historyIndex: 0
      };

    case 'UPDATE_FABRIC_OBJECTS':
      return {
        ...state,
        textLayers: action.layers,
        needsFabricRecreation: false
      };

    case 'FORCE_FABRIC_RECREATION':
      return {
        ...state,
        needsFabricRecreation: true
      };

    default:
      return state;
  }
}