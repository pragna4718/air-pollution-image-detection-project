import pandas as pd

# Load dataset
df = pd.read_csv("data/city_day.csv")

print("Before cleaning:", df.shape)

# Drop missing values
df = df.dropna()

print("After cleaning:", df.shape)

# Select important columns
df = df[['PM2.5', 'PM10', 'NO2', 'AQI']]

# Save cleaned data
df.to_csv("data/cleaned_city_day.csv", index=False)

print("Cleaned dataset saved ✅")