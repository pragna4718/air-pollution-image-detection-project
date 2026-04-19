import os
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, 'data', 'air_quality.csv')
PLOTS_DIR = os.path.join(BASE_DIR, 'plots')


def ensure_plots_dir():
    os.makedirs(PLOTS_DIR, exist_ok=True)


def load_and_preprocess(csv_path=DATA_PATH):
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Air quality CSV not found at {csv_path}. "
            "Create a CSV with columns Date and AQI or PM2.5."
        )

    df = pd.read_csv(csv_path)
    df['Date'] = pd.to_datetime(df['Date'])

    if 'AQI' not in df.columns and 'PM2.5' in df.columns:
        df = df.rename(columns={'PM2.5': 'AQI'})

    df = df.dropna(subset=['AQI'])
    df['AQI'] = df['AQI'].astype(float)
    df['month'] = df['Date'].dt.month
    df['hour'] = df['Date'].dt.hour

    return df


def plot_aqi_over_time(df):
    ensure_plots_dir()
    plt.figure(figsize=(12, 5))
    sns.lineplot(data=df.sort_values('Date'), x='Date', y='AQI', marker='o', linewidth=1.5)
    plt.title('AQI Over Time')
    plt.xlabel('Date')
    plt.ylabel('AQI')
    plt.xticks(rotation=45)
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'aqi_over_time.png')
    plt.savefig(path)
    plt.close()
    print(f'Plot saved: {path}')
    print('Insight: This chart shows the trend of air quality over time. Look for spikes and seasonal changes that may correspond to pollution events or weather patterns.')


def plot_monthly_average(df):
    ensure_plots_dir()
    monthly = df.groupby('month', as_index=False)['AQI'].mean()
    plt.figure(figsize=(10, 5))
    sns.barplot(data=monthly, x='month', y='AQI', palette='coolwarm')
    plt.title('Monthly Average AQI')
    plt.xlabel('Month')
    plt.ylabel('Average AQI')
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'monthly_average_aqi.png')
    plt.savefig(path)
    plt.close()
    print(f'Plot saved: {path}')
    print('Insight: Monthly averages help reveal whether pollution peaks in particular seasons, such as winter months with higher fine particulate matter.')


def plot_hourly_pattern(df):
    ensure_plots_dir()
    hourly = df.groupby('hour', as_index=False)['AQI'].mean()
    plt.figure(figsize=(10, 5))
    sns.lineplot(data=hourly, x='hour', y='AQI', marker='o', linewidth=2)
    plt.title('Hourly AQI Pattern')
    plt.xlabel('Hour of Day')
    plt.ylabel('Average AQI')
    plt.xticks(range(0, 24))
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'hourly_aqi_pattern.png')
    plt.savefig(path)
    plt.close()
    print(f'Plot saved: {path}')
    print('Insight: This line chart shows daily pollution cycles. Peaks may appear during traffic rush hours or industrial activity windows.')


def plot_correlation_heatmap(df):
    ensure_plots_dir()
    numeric_df = df.select_dtypes(include=[np.number])
    corr = numeric_df.corr()
    plt.figure(figsize=(10, 8))
    sns.heatmap(corr, annot=True, cmap='coolwarm', fmt='.2f', square=True)
    plt.title('Correlation Heatmap')
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'correlation_heatmap.png')
    plt.savefig(path)
    plt.close()
    print(f'Plot saved: {path}')
    print('Insight: The heatmap highlights relationships between numerical variables. Strong positive or negative values indicate which features move together.')


def main():
    df = load_and_preprocess()
    print('Loaded dataset:')
    print(df.head())
    print('\nGenerating visualizations...')

    plot_aqi_over_time(df)
    plot_monthly_average(df)
    plot_hourly_pattern(df)
    plot_correlation_heatmap(df)

    print('\nVisualizations complete. Check the ml_api/plots directory for PNG files.')


if __name__ == '__main__':
    main()
