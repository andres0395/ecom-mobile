// Shell de Tauri. No expone comandos Rust: la Biblia carga sus datos desde
// archivos JSON estáticos servidos por el WebView, así que no hace falta
// lógica del lado de Rust.
//
// Si más adelante querés exponer comandos nativos (ej. abrir un archivo local,
// buscar en el sistema de archivos, controlar ventanas), agregalos acá con
// `#[tauri::command]` y registralos en `invoke_handler`.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}