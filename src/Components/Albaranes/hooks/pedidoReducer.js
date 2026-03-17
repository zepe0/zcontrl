const DEFAULT_PRICE_DEFAULTS = {
  ud: 12,
  m2: 23.26,
  ml: 15.38,
};

export const createEmptyMaterialDraft = () => ({
  ref: "",
  mat: "",
  unidad_medida: "ud",
  cantidad: "",
  largo: "",
  ancho: "",
  longitud: "",
  espesor: "",
  unid: "",
  refObra: "",
  ral: "",
  Ral: "",
  precio_unitario: "",
  consumo: "",
});

export const createInitialPedidoData = () => ({
  id: null,
  numAlbaran: "",
  cliente: "",
  Nif: "",
  tel: "",
  dir: "",
  albaran: [],
  firma: null,
  observaciones: "",
  estado: "Borrador",
});

export const createInitialPedidoState = (pedidoId = null) => ({
  pedido: createInitialPedidoData(),
  numeroAlbaran: "",
  clientes: [],
  catalogos: {
    materiales: [],
    pinturas: [],
  },
  nuevoCliente: {
    nombre: "",
    Nif: "",
    tel: "",
    dir: "",
  },
  draftMaterial: createEmptyMaterialDraft(),
  validationIssues: [],
  draftValidationIssues: [],
  stockAvailability: {
    hasIssues: false,
    issues: [],
    missingRals: [],
    message: "",
  },
  statusWarningInfo: null,
  selectedLineIndexes: [],
  lineSnapshots: [],
  extractedData: null,
  flags: {
    isViewingPedido: Boolean(pedidoId),
    isEditMode: !pedidoId,
    showInlineEditor: !pedidoId,
    showReview: false,
    showPricePanel: false,
    isEditingCliente: false,
    isAddingCliente: false,
    isValued: true,
    lineSavedFlash: false,
    clienteSavedFlash: false,
  },
  preferences: {
    printMode: "normal",
    priceDefaults: DEFAULT_PRICE_DEFAULTS,
  },
  meta: {
    pedidoRefreshToken: 0,
    clienteActualizado: 0,
  },
});

export const pedidoActionTypes = {
  SET_PEDIDO: "SET_PEDIDO",
  PATCH_PEDIDO: "PATCH_PEDIDO",
  SET_PEDIDO_FIELD: "SET_PEDIDO_FIELD",
  SET_NUMERO_ALBARAN: "SET_NUMERO_ALBARAN",
  SET_CLIENTES: "SET_CLIENTES",
  SET_CATALOGOS: "SET_CATALOGOS",
  SET_NUEVO_CLIENTE_FIELD: "SET_NUEVO_CLIENTE_FIELD",
  RESET_NUEVO_CLIENTE: "RESET_NUEVO_CLIENTE",
  SET_DRAFT_FIELD: "SET_DRAFT_FIELD",
  RESET_DRAFT: "RESET_DRAFT",
  SET_LINES: "SET_LINES",
  ADD_LINE: "ADD_LINE",
  UPDATE_LINE: "UPDATE_LINE",
  REMOVE_LINE: "REMOVE_LINE",
  SET_VALIDATION_ISSUES: "SET_VALIDATION_ISSUES",
  SET_DRAFT_VALIDATION_ISSUES: "SET_DRAFT_VALIDATION_ISSUES",
  SET_STOCK_AVAILABILITY: "SET_STOCK_AVAILABILITY",
  SET_STATUS_WARNING_INFO: "SET_STATUS_WARNING_INFO",
  SET_SELECTED_LINE_INDEXES: "SET_SELECTED_LINE_INDEXES",
  SET_LINE_SNAPSHOTS: "SET_LINE_SNAPSHOTS",
  SET_EXTRACTED_DATA: "SET_EXTRACTED_DATA",
  SET_FLAG: "SET_FLAG",
  SET_FLAGS: "SET_FLAGS",
  SET_PRICE_DEFAULTS: "SET_PRICE_DEFAULTS",
  SET_PRINT_MODE: "SET_PRINT_MODE",
  INCREMENT_REFRESH_TOKEN: "INCREMENT_REFRESH_TOKEN",
  INCREMENT_CLIENTE_ACTUALIZADO: "INCREMENT_CLIENTE_ACTUALIZADO",
  RESET_ALL: "RESET_ALL",
};

const syncPedidoLines = (state, nextLines) => ({
  ...state,
  pedido: {
    ...state.pedido,
    albaran: nextLines,
  },
});

export const pedidoReducer = (state, action) => {
  switch (action.type) {
    case pedidoActionTypes.SET_PEDIDO:
      return {
        ...state,
        pedido: action.payload,
      };

    case pedidoActionTypes.PATCH_PEDIDO:
      return {
        ...state,
        pedido: {
          ...state.pedido,
          ...action.payload,
        },
      };

    case pedidoActionTypes.SET_PEDIDO_FIELD:
      return {
        ...state,
        pedido: {
          ...state.pedido,
          [action.field]: action.value,
        },
      };

    case pedidoActionTypes.SET_NUMERO_ALBARAN:
      return {
        ...state,
        numeroAlbaran: action.payload,
        pedido: {
          ...state.pedido,
          numAlbaran: action.payload,
        },
      };

    case pedidoActionTypes.SET_CLIENTES:
      return {
        ...state,
        clientes: action.payload,
      };

    case pedidoActionTypes.SET_CATALOGOS:
      return {
        ...state,
        catalogos: {
          ...state.catalogos,
          ...action.payload,
        },
      };

    case pedidoActionTypes.SET_NUEVO_CLIENTE_FIELD:
      return {
        ...state,
        nuevoCliente: {
          ...state.nuevoCliente,
          [action.field]: action.value,
        },
      };

    case pedidoActionTypes.RESET_NUEVO_CLIENTE:
      return {
        ...state,
        nuevoCliente: createInitialPedidoState().nuevoCliente,
      };

    case pedidoActionTypes.SET_DRAFT_FIELD:
      return {
        ...state,
        draftMaterial: {
          ...state.draftMaterial,
          [action.field]: action.value,
        },
      };

    case pedidoActionTypes.RESET_DRAFT:
      return {
        ...state,
        draftMaterial: createEmptyMaterialDraft(),
        draftValidationIssues: [],
      };

    case pedidoActionTypes.SET_LINES:
      return syncPedidoLines(state, action.payload);

    case pedidoActionTypes.ADD_LINE:
      return syncPedidoLines(state, [...state.pedido.albaran, action.payload]);

    case pedidoActionTypes.UPDATE_LINE: {
      const nextLines = [...state.pedido.albaran];
      nextLines[action.index] = action.payload;
      return syncPedidoLines(state, nextLines);
    }

    case pedidoActionTypes.REMOVE_LINE: {
      const nextLines = state.pedido.albaran.filter(
        (_, index) => index !== action.index,
      );
      return {
        ...syncPedidoLines(state, nextLines),
        lineSnapshots: state.lineSnapshots.filter(
          (_, index) => index !== action.index,
        ),
        selectedLineIndexes: state.selectedLineIndexes
          .filter((idx) => idx !== action.index)
          .map((idx) => (idx > action.index ? idx - 1 : idx)),
      };
    }

    case pedidoActionTypes.SET_VALIDATION_ISSUES:
      return {
        ...state,
        validationIssues: action.payload,
      };

    case pedidoActionTypes.SET_DRAFT_VALIDATION_ISSUES:
      return {
        ...state,
        draftValidationIssues: action.payload,
      };

    case pedidoActionTypes.SET_STOCK_AVAILABILITY:
      return {
        ...state,
        stockAvailability: action.payload,
      };

    case pedidoActionTypes.SET_STATUS_WARNING_INFO:
      return {
        ...state,
        statusWarningInfo: action.payload,
      };

    case pedidoActionTypes.SET_SELECTED_LINE_INDEXES:
      return {
        ...state,
        selectedLineIndexes: action.payload,
      };

    case pedidoActionTypes.SET_LINE_SNAPSHOTS:
      return {
        ...state,
        lineSnapshots: action.payload,
      };

    case pedidoActionTypes.SET_EXTRACTED_DATA:
      return {
        ...state,
        extractedData: action.payload,
      };

    case pedidoActionTypes.SET_FLAG:
      return {
        ...state,
        flags: {
          ...state.flags,
          [action.flag]: action.value,
        },
      };

    case pedidoActionTypes.SET_FLAGS:
      return {
        ...state,
        flags: {
          ...state.flags,
          ...action.payload,
        },
      };

    case pedidoActionTypes.SET_PRICE_DEFAULTS:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          priceDefaults: {
            ...state.preferences.priceDefaults,
            ...action.payload,
          },
        },
      };

    case pedidoActionTypes.SET_PRINT_MODE:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          printMode: action.payload,
        },
      };

    case pedidoActionTypes.INCREMENT_REFRESH_TOKEN:
      return {
        ...state,
        meta: {
          ...state.meta,
          pedidoRefreshToken: state.meta.pedidoRefreshToken + 1,
        },
      };

    case pedidoActionTypes.INCREMENT_CLIENTE_ACTUALIZADO:
      return {
        ...state,
        meta: {
          ...state.meta,
          clienteActualizado: state.meta.clienteActualizado + 1,
        },
      };

    case pedidoActionTypes.RESET_ALL:
      return createInitialPedidoState(action.payload?.pedidoId ?? null);

    default:
      return state;
  }
};

export const defaultPriceDefaults = DEFAULT_PRICE_DEFAULTS;
