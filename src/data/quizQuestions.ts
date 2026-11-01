import { QuizQuestion } from '../types';

export const PYTHON_PRACTICE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: 'NumPy Array Reshaping & Slicing',
    category: 'NumPy',
    difficulty: 'Beginner',
    prompt: 'What will be the shape and output of arr[1, :] after executing the following NumPy code snippet?',
    code: `import numpy as np

arr = np.array([[10, 20, 30], [40, 50, 60]])
result = arr[1, :]
print(result.shape, result)`,
    options: [
      { id: 'a', text: '(3,) [40 50 60]' },
      { id: 'b', text: '(1, 3) [[40, 50, 60]]' },
      { id: 'c', text: '(2,) [10 40]' },
      { id: 'd', text: '(3, 1) [[40], [50], [60]]' },
    ],
    correctOptionId: 'a',
    explanation:
      'In NumPy 2D array indexing, arr[row, col] with an integer row index (1) selects the second row [40, 50, 60]. Because row index 1 is a scalar integer, the dimension collapses into a 1D vector of shape (3,). To maintain a 2D matrix shape of (1, 3), one would slice using arr[1:2, :].',
    whyWrongNotes: {
      b: '(1, 3) requires a slice on the row dimension such as arr[1:2, :]. An integer index collapses the dimension.',
      c: '[10, 40] would be the first column, accessed via arr[:, 0].',
      d: '(3, 1) represents a 2D column vector, not a standard 1D horizontal slice.',
    },
  },
  {
    id: 2,
    title: 'Pandas DataFrame Filtering with loc vs iloc',
    category: 'Pandas',
    difficulty: 'Beginner',
    prompt: 'Which statement correctly explains the difference between df.loc and df.iloc in pandas?',
    code: `# Given a pandas DataFrame 'df' of sensor readings
# with custom index ['sensor_A', 'sensor_B', 'sensor_C']`,
    options: [
      { id: 'a', text: 'loc is label-based indexing; iloc is integer position-based indexing.' },
      { id: 'b', text: 'loc is integer position-based; iloc is column label-based.' },
      { id: 'c', text: 'Both loc and iloc use zero-based integer indices interchangeably.' },
      { id: 'd', text: 'iloc includes both start and stop bounds, whereas loc excludes stop bound.' },
    ],
    correctOptionId: 'a',
    explanation:
      '.loc is strictly label-based (using row names and column names, e.g. df.loc["sensor_A", "temperature"]). In contrast, .iloc is strictly integer position-based (e.g. df.iloc[0, 1]). Notice also that .loc slices include both the start and end label inclusive, whereas .iloc follows Python standard slice notation where the stop index is excluded.',
    whyWrongNotes: {
      b: 'This reverses their roles: loc stands for location (labels), iloc stands for integer location.',
      c: 'They are not interchangeable; passing string labels into iloc throws a TypeError.',
      d: 'In fact, loc includes the stop label, while iloc excludes the stop integer.',
    },
  },
  {
    id: 3,
    title: 'Scikit-Learn Stratified Splitting for Imbalanced Data',
    category: 'Scikit-Learn',
    difficulty: 'Beginner',
    prompt: 'When training a credit card fraud detection model where fraud accounts for only 0.2% of transactions, what does the stratify=y parameter in train_test_split guarantee?',
    code: `from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)`,
    options: [
      { id: 'a', text: 'Preserves the identical 0.2% proportion of fraud labels in both train and test splits.' },
      { id: 'b', text: 'Automatically oversamples minority fraud transactions using SMOTE.' },
      { id: 'c', text: 'Sorts all features by variance and removes low-correlation columns.' },
      { id: 'd', text: 'Normalizes numerical sensor features to standard mean 0 and variance 1.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Stratified sampling ensures that each split (train and test) contains approximately the same percentage of samples of each target class as the complete dataset. For severe class imbalance (like fraud or rare industrial failure), non-stratified random splitting might yield a test set with 0 fraud instances, making evaluation impossible.',
    whyWrongNotes: {
      b: 'SMOTE oversampling is handled by imblearn, not train_test_split.',
      c: 'Feature variance sorting is done via VarianceThreshold or PCA.',
      d: 'Feature scaling is performed by StandardScaler or MinMaxScaler.',
    },
  },
  {
    id: 4,
    title: 'Python List Comprehension vs Generator Memory',
    category: 'Core Python',
    difficulty: 'Beginner',
    prompt: 'What is the primary memory and execution difference between [x**2 for x in data] and (x**2 for x in data)?',
    code: `# List comprehension
list_comp = [x * 2 for x in range(10_000_000)]

# Generator expression
gen_exp = (x * 2 for x in range(10_000_000))`,
    options: [
      { id: 'a', text: 'The list comprehension allocates all elements in RAM at once; the generator yields items lazily on demand.' },
      { id: 'b', text: 'The generator expression creates an immutable tuple in memory.' },
      { id: 'c', text: 'The list comprehension runs asynchronously on multiple CPU cores.' },
      { id: 'd', text: 'There is no functional or memory difference in modern Python 3.12+.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Brackets [] construct a full list in memory immediately (allocating hundreds of megabytes for large datasets). Parentheses () create a generator object that evaluates lazily using the iterator protocol, producing values one by one with O(1) constant memory footprint.',
    whyWrongNotes: {
      b: 'Parentheses with a comprehension create a generator object, not a tuple. To create a tuple, you must pass it to tuple().',
      c: 'Python list comprehensions are single-threaded and run synchronously on the GIL.',
      d: 'Memory consumption differences are massive (hundreds of MBs vs bytes).',
    },
  },
  {
    id: 5,
    title: 'Pandas GroupBy & Multi-Metric Aggregation',
    category: 'Pandas',
    difficulty: 'Beginner',
    prompt: 'How do you compute both the mean temperature and maximum torque for each machine_type in a sensor telemetry DataFrame?',
    code: `df.groupby('machine_type').agg({
    'temperature': 'mean',
    'torque': 'max'
})`,
    options: [
      { id: 'a', text: 'Pass a dictionary of column names to aggregation functions to .agg().' },
      { id: 'b', text: 'Chain multiple groupby calls: df.groupby().mean().groupby().max()' },
      { id: 'c', text: 'Use df.pivot_table(index="machine_type", values=["mean", "max"])' },
      { id: 'd', text: 'DataFrame.groupby() only accepts a single aggregation function at a time.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Pandas .agg() (or .aggregate()) accepts a dictionary mapping column names to desired aggregation functions (e.g., {"col1": "mean", "col2": "max", "col3": ["min", "max"]}), allowing heterogeneous multi-column analytics in a single vectorized pass.',
    whyWrongNotes: {
      b: 'Chaining multiple groupby calls causes attribute errors or loses column structure.',
      c: 'pivot_table values parameter specifies data columns, not function strings.',
      d: 'Pandas has supported multi-function dictionary aggregations for many versions.',
    },
  },
  {
    id: 6,
    title: 'Python Exception Handling Control Flow',
    category: 'Core Python',
    difficulty: 'Beginner',
    prompt: 'In Python try...except...else...finally, when does the else block execute?',
    code: `try:
    sensor_value = float(telemetry_packet["voltage"])
except (KeyError, ValueError):
    log_sensor_error()
else:
    process_valid_sensor(sensor_value)
finally:
    close_telemetry_socket()`,
    options: [
      { id: 'a', text: 'Only when the try block executes successfully without raising any exceptions.' },
      { id: 'b', text: 'Whenever an exception is caught and handled inside the except block.' },
      { id: 'c', text: 'In all circumstances, right before the finally block.' },
      { id: 'd', text: 'Only if both the try and except blocks fail.' },
    ],
    correctOptionId: 'a',
    explanation:
      'In Python, the else clause after try/except executes ONLY when NO exception occurred in the try block. This is best practice because it avoids accidentally catching exceptions raised inside process_valid_sensor() within the try block.',
    whyWrongNotes: {
      b: 'Code that runs when an exception is caught belongs inside the except block.',
      c: 'The block that always executes regardless of exceptions is finally, not else.',
      d: 'If both fail, an unhandled exception propagates up the call stack.',
    },
  },
  {
    id: 7,
    title: 'Scikit-Learn Pipeline & Preventing Data Leakage',
    category: 'Scikit-Learn',
    difficulty: 'Intermediate',
    prompt: 'Why should feature scaling (e.g., StandardScaler) be placed inside a scikit-learn Pipeline during cross-validation?',
    code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', RandomForestClassifier())
])`,
    options: [
      { id: 'a', text: 'To ensure the scaler fits only on the training fold, preventing test data leakage.' },
      { id: 'b', text: 'Because StandardScaler cannot be used directly with scikit-learn classifiers.' },
      { id: 'c', text: 'To automatically convert categorical string features into one-hot vectors.' },
      { id: 'd', text: 'To speed up training by caching memory on GPU VRAM.' },
    ],
    correctOptionId: 'a',
    explanation:
      'If you scale the entire dataset before splitting or cross-validating, the test fold information (mean and standard deviation) "leaks" into the scaler parameters. Wrapping the scaler and model inside a Pipeline ensures that fit() is applied exclusively to the training folds, and transform() is applied to test folds, mirroring real production inference.',
    whyWrongNotes: {
      b: 'StandardScaler can certainly be fitted standalone, but doing so globally leaks test statistics.',
      c: 'One-hot encoding is handled by OneHotEncoder, not StandardScaler.',
      d: 'Scikit-learn Pipelines execute primarily on CPU, not GPU.',
    },
  },
  {
    id: 8,
    title: 'Dictionary Safe Lookups & Default Values',
    category: 'Core Python',
    difficulty: 'Beginner',
    prompt: 'What happens when accessing a non-existent key using config.get("batch_size", 64) vs config["batch_size"]?',
    code: `config = {"learning_rate": 0.001, "epochs": 50}

val_a = config.get("batch_size", 64)
# val_b = config["batch_size"]`,
    options: [
      { id: 'a', text: 'val_a returns default 64 without raising an error; config["batch_size"] raises a KeyError.' },
      { id: 'b', text: 'Both return None without throwing any error.' },
      { id: 'c', text: 'config.get automatically inserts {"batch_size": 64} permanently into the dictionary.' },
      { id: 'd', text: 'val_a throws an AttributeError because get() is not a dict method.' },
    ],
    correctOptionId: 'a',
    explanation:
      'dict.get(key, default) safely returns the supplied fallback default (64) if key is missing. Bracket lookup config[key] raises an immediate KeyError if the key is absent. Note that dict.setdefault() inserts the key, while .get() leaves the original dictionary unchanged.',
    whyWrongNotes: {
      b: 'Square brackets config["missing"] strictly raises a KeyError, never None.',
      c: 'dict.get() does not mutate the dict. To insert on miss, use dict.setdefault().',
      d: 'dict.get is a foundational built-in method in Python dictionaries.',
    },
  },
  {
    id: 9,
    title: 'Vectorized Boolean Masking with NumPy/Pandas',
    category: 'NumPy',
    difficulty: 'Beginner',
    prompt: 'Given an array of machine temperatures, how do you filter for values greater than 310K without a slow Python for-loop?',
    code: `import numpy as np
temps = np.array([298.1, 312.4, 305.0, 315.8, 299.5])`,
    options: [
      { id: 'a', text: 'temps[temps > 310] (Vectorized boolean masking in C)' },
      { id: 'b', text: '[t for t in temps if t.filter(310)]' },
      { id: 'c', text: 'temps.where(310)' },
      { id: 'd', text: 'temps.split(lambda x: x > 310)' },
    ],
    correctOptionId: 'a',
    explanation:
      'In NumPy, boolean expressions like temps > 310 evaluate at compiled C speed into a boolean array [False, True, False, True, False]. Passing this mask back into temps[mask] directly filters the array elements in nanoseconds without Python interpreter loop overhead.',
    whyWrongNotes: {
      b: 'Floats do not have a .filter() method in Python.',
      c: 'numpy.where(condition) returns indices unless specified with (condition, x, y).',
      d: 'NumPy arrays do not have a .split(lambda) method.',
    },
  },
  {
    id: 10,
    title: 'Model Evaluation: Precision vs Recall in Anomaly Detection',
    category: 'Machine Learning Engineering',
    difficulty: 'Intermediate',
    prompt: 'In industrial turbine failure prevention, why do reliability engineers typically prioritize High Recall over High Precision?',
    code: `# Recall = TP / (TP + FN)  -> Minimize False Negatives
# Precision = TP / (TP + FP) -> Minimize False Positives`,
    options: [
      { id: 'a', text: 'A False Negative (catastrophic unpredicted turbine explosion) is far more dangerous/expensive than a False Positive (inspecting a functional turbine).' },
      { id: 'b', text: 'Recall can be calculated without knowing True Positives.' },
      { id: 'c', text: 'High Precision automatically guarantees zero False Negatives.' },
      { id: 'd', text: 'Scikit-learn models cannot optimize Precision on sensor data.' },
    ],
    correctOptionId: 'a',
    explanation:
      'In safety-critical predictive maintenance and high-risk fraud detection, the asymmetry of error costs dictates the metric: missing a failure (False Negative) can destroy multi-million-dollar industrial machinery or endanger human lives. A False Positive simply results in a safe precautionary maintenance inspection.',
    whyWrongNotes: {
      b: 'Recall formula strictly requires True Positives: TP / (TP + FN).',
      c: 'In fact, Precision and Recall typically trade off against each other as decision thresholds change.',
      d: 'Any binary classification algorithm can be tuned for precision via threshold calibration.',
    },
  },
];
