#![deny(clippy::all)]

use std::fs::File;
use std::sync::Arc;
use std::time::Duration;

use napi::threadsafe_function::{ThreadsafeFunction, ThreadsafeFunctionCallMode};
use napi::Result;
use napi_derive::napi;
use remu_audio::events::PlayerEvent;
use remu_audio::loader::LoaderEvent;
use remu_audio::player::PlaybackControl;
use remu_audio::player::Player;
use rodio::{Decoder, OutputStreamBuilder, Sink};

#[napi(object)]
pub struct JsPlayerEventData {
  pub event_type: String,
  pub message: Option<String>,
}

#[napi]
pub struct BindingPlayer {
  player: Player,
}

#[napi]
impl BindingPlayer {
  #[napi(constructor)]
  pub fn new() -> Result<Self> {
    let player = Player::new().map_err(|e| napi::Error::from_reason(e.to_string()))?;

    Ok(BindingPlayer { player })
  }

  #[napi]
  pub fn play(&self) {
    println!("Playing audio");
    println!("Position before play: {:?}", self.player.position());
    println!("Duration: {:?}", self.player.duration());
    println!("Paused: {:?}", self.player.paused());
    self.player.play();
    println!("Position after play: {:?}", self.player.position());
  }

  #[napi]
  pub fn pause(&self) {
    self.player.pause();
  }

  #[napi]
  pub fn stop(&mut self) {
    self.player.stop();
  }

  #[napi]
  pub fn seek(&self, position: f64) -> Result<()> {
    self
      .player
      .seek(Duration::from_secs_f64(position))
      .map_err(|e| napi::Error::from_reason(e.to_string()))?;
    Ok(())
  }

  #[napi]
  pub fn set_volume(&self, volume: f64) {
    self.player.set_volume(volume as f32);
  }

  #[napi(getter)]
  pub fn volume(&self) -> f64 {
    self.player.volume() as f64
  }

  #[napi(getter)]
  pub fn paused(&self) -> bool {
    self.player.paused()
  }

  #[napi(getter)]
  pub fn position(&self) -> f64 {
    self.player.position().as_secs_f64()
  }

  #[napi(getter)]
  pub fn ended(&self) -> bool {
    self.player.ended()
  }

  #[napi(getter)]
  pub fn duration(&self) -> Option<f64> {
    self.player.duration().map(|d| d.as_secs_f64())
  }

  #[napi]
  /// Load a local file into the player.
  ///
  /// # Safety
  ///
  /// 调用者必须保证在函数执行期间没有其他线程或 JavaScript 回调并发访问同一 `BindingPlayer` 实例。
  /// 特别是，在该函数的 `.await` 点之前后，调用者必须保证对 `self` 的独占可变访问，以避免数据竞争或未定义行为。
  pub async unsafe fn load_file(&mut self, file_path: String) -> Result<()> {
    println!("Loading file: {}", file_path);
    self
      .player
      .load_file(&file_path)
      .await
      .map_err(|e| napi::Error::from_reason(e.to_string()))?;
    println!("Duration after load: {:?}", self.player.duration());
    Ok(())
  }

  #[napi]
  /// Load a remote URL into the player.
  ///
  /// # Safety
  ///
  /// 调用者必须保证在函数执行期间没有其他线程或 JavaScript 回调并发访问同一 `BindingPlayer` 实例。
  /// 特别是，在该函数的 `.await` 点之前后，调用者必须保证对 `self` 的独占可变访问，以避免数据竞争或未定义行为。
  pub async unsafe fn load_url(&mut self, url: String) -> Result<()> {
    self
      .player
      .load_url(&url)
      .await
      .map_err(|e| napi::Error::from_reason(e.to_string()))?;
    Ok(())
  }

  #[napi]
  pub fn set_callback(&self, callback: ThreadsafeFunction<JsPlayerEventData>) {
    let callback_arc = Arc::new(callback);
    self.player.set_callback({
      let callback = callback_arc.clone();
      move |event| {
        let event_data = match event {
          PlayerEvent::Play => JsPlayerEventData {
            event_type: "play".to_string(),
            message: None,
          },
          PlayerEvent::Pause => JsPlayerEventData {
            event_type: "pause".to_string(),
            message: None,
          },
          PlayerEvent::Waiting => JsPlayerEventData {
            event_type: "waiting".to_string(),
            message: None,
          },
          PlayerEvent::Playing => JsPlayerEventData {
            event_type: "playing".to_string(),
            message: None,
          },
          PlayerEvent::Ended => JsPlayerEventData {
            event_type: "ended".to_string(),
            message: None,
          },
          PlayerEvent::Emptied => JsPlayerEventData {
            event_type: "emptied".to_string(),
            message: None,
          },
          PlayerEvent::DurationChange => JsPlayerEventData {
            event_type: "durationchange".to_string(),
            message: None,
          },
          PlayerEvent::VolumeChange => JsPlayerEventData {
            event_type: "volumechange".to_string(),
            message: None,
          },
          PlayerEvent::Seeking => JsPlayerEventData {
            event_type: "seeking".to_string(),
            message: None,
          },
          PlayerEvent::Seeked => JsPlayerEventData {
            event_type: "seeked".to_string(),
            message: None,
          },
          PlayerEvent::LoadStart => JsPlayerEventData {
            event_type: "loadstart".to_string(),
            message: None,
          },
          PlayerEvent::LoadedData => JsPlayerEventData {
            event_type: "loadeddata".to_string(),
            message: None,
          },
          PlayerEvent::LoadedMetadata => JsPlayerEventData {
            event_type: "loadedmetadata".to_string(),
            message: None,
          },
          PlayerEvent::Error { message } => JsPlayerEventData {
            event_type: "error".to_string(),
            message: Some(message),
          },
        };
        callback.call(Ok(event_data), ThreadsafeFunctionCallMode::NonBlocking);
      }
    });

    self.player.set_loader_callback({
      let callback = callback_arc.clone();
      move |event| {
        let event_data = match event {
          LoaderEvent::Completed => JsPlayerEventData {
            event_type: "completed".to_string(),
            message: None,
          },
          LoaderEvent::Aborted => JsPlayerEventData {
            event_type: "aborted".to_string(),
            message: None,
          },
        };
        callback.call(Ok(event_data), ThreadsafeFunctionCallMode::NonBlocking);
      }
    });
  }
}

use std::thread;

#[napi]
pub fn play(file_path: String) {
  let stream = OutputStreamBuilder::open_default_stream().unwrap();
  let mixer = stream.mixer();
  let file = File::open(file_path).unwrap();
  let source = Decoder::try_from(file).unwrap();
  let sink = Sink::connect_new(mixer);
  sink.append(source);
  thread::sleep(Duration::from_secs(5));
}
