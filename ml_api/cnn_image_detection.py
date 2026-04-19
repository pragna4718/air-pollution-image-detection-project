import os
import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, 'data', 'images')
MODEL_DIR = os.path.join(BASE_DIR, '..', 'model')
MODEL_PATH = os.path.join(MODEL_DIR, 'model.h5')
IMAGE_SIZE = (128, 128)
BATCH_SIZE = 32
CLASS_NAMES = ['Clean', 'Polluted']


def build_cnn_model(input_shape=(128, 128, 3)):
    model = models.Sequential([
        layers.Rescaling(1.0 / 255, input_shape=input_shape),
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dropout(0.4),
        layers.Dense(128, activation='relu'),
        layers.Dense(1, activation='sigmoid')
    ])
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    return model


def prepare_datasets(data_dir, image_size=IMAGE_SIZE, batch_size=BATCH_SIZE):
    if not os.path.exists(data_dir):
        raise FileNotFoundError(
            f"Training directory not found: {data_dir}. "
            "Create folders like data/images/train/Clean and data/images/train/Polluted."
        )

    train_dir = os.path.join(data_dir, 'train')
    validation_dir = os.path.join(data_dir, 'validation')

    if not os.path.exists(train_dir) or not os.path.exists(validation_dir):
        raise FileNotFoundError(
            f"Required subdirectories missing. Expect {train_dir} and {validation_dir}."
        )

    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        train_dir,
        labels='inferred',
        label_mode='binary',
        batch_size=batch_size,
        image_size=image_size,
        shuffle=True,
        seed=42
    )

    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        validation_dir,
        labels='inferred',
        label_mode='binary',
        batch_size=batch_size,
        image_size=image_size,
        shuffle=False
    )

    return train_ds, val_ds


def plot_history(history):
    plt.figure(figsize=(10, 4))
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Training Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(BASE_DIR, 'training_accuracy.png'))
    plt.close()

    plt.figure(figsize=(10, 4))
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Training Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(BASE_DIR, 'training_loss.png'))
    plt.close()


def main():
    print('Preparing datasets...')
    train_ds, val_ds = prepare_datasets(DATA_DIR)
    print('Dataset classes:', train_ds.class_names)

    model = build_cnn_model(input_shape=IMAGE_SIZE + (3,))
    model.summary()

    print('Training model...')
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=10
    )

    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save(MODEL_PATH)
    print(f'Model saved to {MODEL_PATH}')

    print('Evaluating model...')
    loss, accuracy = model.evaluate(val_ds)
    print(f'Validation accuracy: {accuracy:.4f}, loss: {loss:.4f}')

    plot_history(history)
    print('Training plots saved in ml_api/ (training_accuracy.png and training_loss.png)')


if __name__ == '__main__':
    main()
