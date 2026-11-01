import React, { useState } from 'react';
import {
  Car,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Calendar,
  Gauge,
  Fuel,
  Briefcase,
  GraduationCap,
  Users,
  Clock,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  CarPriceInput,
  CarPriceResult,
  IncomeInput,
  IncomeResult,
  FastApiConfig,
} from '../../types';
import { predictCarPrice, predictIncome } from '../../services/api';
import { EngineBadge } from '../common/StatusBadge';

interface CarIncomeModuleProps {
  config: FastApiConfig;
}

const DEFAULT_CAR_INPUT: CarPriceInput = {
  make: 'Toyota',
  year: 2022,
  mileageKm: 42000,
  fuelType: 'Hybrid',
  transmission: 'Automatic',
  engineSizeL: 2.5,
  horsepower: 219,
  condition: 'Excellent',
  bodyType: 'SUV',
};

const CAR_PRESETS = [
  {
    name: '2022 Toyota RAV4 Hybrid',
    desc: '42k km, Excellent Condition, SUV',
    data: {
      make: 'Toyota',
      year: 2022,
      mileageKm: 42000,
      fuelType: 'Hybrid' as const,
      transmission: 'Automatic' as const,
      engineSizeL: 2.5,
      horsepower: 219,
      condition: 'Excellent' as const,
      bodyType: 'SUV' as const,
    },
  },
  {
    name: '2018 BMW 3 Series Sedan',
    desc: '88k km, Good Condition, 248 hp',
    data: {
      make: 'BMW',
      year: 2018,
      mileageKm: 88000,
      fuelType: 'Petrol' as const,
      transmission: 'Automatic' as const,
      engineSizeL: 2.0,
      horsepower: 248,
      condition: 'Good' as const,
      bodyType: 'Sedan' as const,
    },
  },
  {
    name: '2024 Tesla Model 3 Long Range',
    desc: '15k km, Electric AWD, 394 hp',
    data: {
      make: 'Tesla',
      year: 2024,
      mileageKm: 15000,
      fuelType: 'Electric' as const,
      transmission: 'Automatic' as const,
      engineSizeL: 0.0,
      horsepower: 394,
      condition: 'Excellent' as const,
      bodyType: 'Sedan' as const,
    },
  },
  {
    name: '2015 Ford F-150 Truck',
    desc: '165k km, High Mileage, Fair Condition',
    data: {
      make: 'Ford',
      year: 2015,
      mileageKm: 165000,
      fuelType: 'Petrol' as const,
      transmission: 'Automatic' as const,
      engineSizeL: 3.5,
      horsepower: 365,
      condition: 'Fair' as const,
      bodyType: 'Truck' as const,
    },
  },
];

const DEFAULT_INCOME_INPUT: IncomeInput = {
  age: 38,
  education: 'Bachelors',
  occupation: 'Tech-Support',
  hoursPerWeek: 45,
  capitalGain: 2500,
  capitalLoss: 0,
  maritalStatus: 'Married-civ-spouse',
  workClass: 'Private',
};

const INCOME_PRESETS = [
  {
    name: 'Principal Software Architect',
    desc: 'Masters, Exec/Tech, 45 hrs/wk, Married',
    data: {
      age: 42,
      education: 'Masters' as const,
      occupation: 'Exec-Managerial' as const,
      hoursPerWeek: 48,
      capitalGain: 12000,
      capitalLoss: 0,
      maritalStatus: 'Married-civ-spouse' as const,
      workClass: 'Private' as const,
    },
  },
  {
    name: 'Early Career Graduate',
    desc: '24 yrs, Bachelors, 40 hrs/wk, Single',
    data: {
      age: 24,
      education: 'Bachelors' as const,
      occupation: 'Administrative' as const,
      hoursPerWeek: 40,
      capitalGain: 0,
      capitalLoss: 0,
      maritalStatus: 'Never-married' as const,
      workClass: 'Private' as const,
    },
  },
  {
    name: 'Specialist Physician / Doctorate',
    desc: 'Doctorate, Prof-Specialty, High Gains',
    data: {
      age: 49,
      education: 'Doctorate' as const,
      occupation: 'Prof-Specialty' as const,
      hoursPerWeek: 55,
      capitalGain: 18500,
      capitalLoss: 0,
      maritalStatus: 'Married-civ-spouse' as const,
      workClass: 'Self-emp-inc' as const,
    },
  },
  {
    name: 'Retail Associate',
    desc: 'High School Grad, 32 hrs/wk, Single',
    data: {
      age: 28,
      education: 'HS-grad' as const,
      occupation: 'Other-service' as const,
      hoursPerWeek: 32,
      capitalGain: 0,
      capitalLoss: 0,
      maritalStatus: 'Never-married' as const,
      workClass: 'Private' as const,
    },
  },
];

export const CarIncomeModule: React.FC<CarIncomeModuleProps> = ({ config }) => {
  const [subModule, setSubModule] = useState<'car' | 'income'>('car');

  // Car State
  const [carForm, setCarForm] = useState<CarPriceInput>(DEFAULT_CAR_INPUT);
  const [carLoading, setCarLoading] = useState(false);
  const [carResult, setCarResult] = useState<CarPriceResult | null>(null);

  // Income State
  const [incomeForm, setIncomeForm] = useState<IncomeInput>(DEFAULT_INCOME_INPUT);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [incomeResult, setIncomeResult] = useState<IncomeResult | null>(null);

  const handlePredictCar = async (data = carForm) => {
    setCarLoading(true);
    try {
      const res = await predictCarPrice(data, config);
      setCarResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCarLoading(false);
    }
  };

  const handlePredictIncome = async (data = incomeForm) => {
    setIncomeLoading(true);
    try {
      const res = await predictIncome(data, config);
      setIncomeResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIncomeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e172a] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              MODULE 05
            </span>
            <EngineBadge isDemoMode={config.mode === 'demo'} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Valuation & Demographic Intelligence Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Dual predictive engine: Secondary automotive market price regression with forward depreciation curves, and UCI Census household income threshold classification.
          </p>
        </div>

        {/* Sub-module Switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start md:self-auto shrink-0">
          <button
            onClick={() => setSubModule('car')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              subModule === 'car'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Car Price Valuation
          </button>
          <button
            onClick={() => setSubModule('income')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              subModule === 'income'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Household Income Prediction
          </button>
        </div>
      </div>

      {subModule === 'car' ? (
        /* SUB-MODULE A: Car Price Valuation */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Car Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Presets */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Automotive Profiles (Click to Load)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCarForm(p.data);
                      handlePredictCar(p.data);
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition group"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Car Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePredictCar();
              }}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-cyan-400" />
                  Vehicle Specifications & Condition
                </h3>
                <button
                  type="button"
                  onClick={() => setCarForm(DEFAULT_CAR_INPUT)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Make */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Vehicle Make</label>
                  <select
                    value={carForm.make}
                    onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {['Toyota', 'BMW', 'Honda', 'Mercedes', 'Tesla', 'Ford', 'Audi', 'Hyundai'].map(
                      (m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Model Year */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium">Model Year</label>
                    <span className="font-mono text-cyan-300 font-bold">{carForm.year}</span>
                  </div>
                  <input
                    type="range"
                    min="2012"
                    max="2026"
                    step="1"
                    value={carForm.year}
                    onChange={(e) => setCarForm({ ...carForm, year: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>2012 (Older)</span>
                    <span>2026 (Brand New)</span>
                  </div>
                </div>

                {/* Mileage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium">Odometer Mileage</label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {carForm.mileageKm.toLocaleString()} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="220000"
                    step="2000"
                    value={carForm.mileageKm}
                    onChange={(e) =>
                      setCarForm({ ...carForm, mileageKm: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>2,000 km</span>
                    <span>220,000 km</span>
                  </div>
                </div>

                {/* Horsepower */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium">Horsepower (HP)</label>
                    <span className="font-mono text-cyan-300 font-bold">{carForm.horsepower} hp</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="550"
                    step="5"
                    value={carForm.horsepower}
                    onChange={(e) =>
                      setCarForm({ ...carForm, horsepower: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>100 hp</span>
                    <span>550 hp</span>
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Powertrain / Fuel</label>
                  <select
                    value={carForm.fuelType}
                    onChange={(e) => setCarForm({ ...carForm, fuelType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Petrol">Petrol (Gasoline)</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">All-Electric (BEV)</option>
                  </select>
                </div>

                {/* Condition */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Condition Grade</label>
                  <select
                    value={carForm.condition}
                    onChange={(e) => setCarForm({ ...carForm, condition: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Excellent">Excellent (Like-New, Fully Maintained)</option>
                    <option value="Good">Good (Normal Wear, Clean Record)</option>
                    <option value="Fair">Fair (Cosmetic Scratches, Minor Work Needed)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={carLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-950/60 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {carLoading ? (
                  <Car className="w-5 h-5 animate-spin" />
                ) : (
                  <Car className="w-5 h-5" />
                )}
                {carLoading ? 'Estimating Valuation...' : 'Estimate Secondary Market Value'}
              </button>
            </form>
          </div>

          {/* Right Column: Car Results (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {carResult ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Result Card */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Estimated Market Valuation
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                      Confidence 91%
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Fair Market Value
                    </div>
                    <div className="text-3xl font-extrabold font-mono text-cyan-300 mt-1">
                      ${carResult.estimatedPrice.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                      <span>
                        Range: ${carResult.priceRangeLow.toLocaleString()} - $
                        {carResult.priceRangeHigh.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 5-Year Depreciation Chart */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      5-Year Forward Depreciation Curve
                    </span>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={carResult.depreciationCurve}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#090d16',
                              borderColor: '#334155',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '11px',
                            }}
                            formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Value']}
                          />
                          <Line
                            type="monotone"
                            dataKey="estimatedValue"
                            stroke="#06b6d4"
                            strokeWidth={2.5}
                            dot={{ fill: '#06b6d4', r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Value Factors Breakdown */}
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Valuation Impact Factors
                    </span>
                    <div className="space-y-1.5">
                      {carResult.factorBreakdown.map((f, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-200">{f.factor}</span>
                            <p className="text-[10px] text-slate-500">{f.description}</p>
                          </div>
                          <span
                            className={`font-mono font-bold shrink-0 ml-2 ${
                              f.impactDollars >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {f.impactDollars >= 0 ? `+$${f.impactDollars.toLocaleString()}` : `-$${Math.abs(f.impactDollars).toLocaleString()}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                <Car className="w-10 h-10 text-cyan-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Car Valuation Ready</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Adjust vehicle parameters or pick a preset scenario on the left, then click{' '}
                  <span className="text-cyan-300 font-semibold">Estimate Secondary Market Value</span>.
                </p>
                <button
                  onClick={() => handlePredictCar()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition"
                >
                  Estimate Sample Car
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SUB-MODULE B: Household Income Classification */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Income Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Presets */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Demographic Profiles (Click to Load)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INCOME_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIncomeForm(p.data);
                      handlePredictIncome(p.data);
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition group"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Income Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePredictIncome();
              }}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Socioeconomic & Census Attributes
                </h3>
                <button
                  type="button"
                  onClick={() => setIncomeForm(DEFAULT_INCOME_INPUT)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium">Individual Age</label>
                    <span className="font-mono text-cyan-300 font-bold">{incomeForm.age} yrs</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="80"
                    step="1"
                    value={incomeForm.age}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, age: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>18 yrs</span>
                    <span>80 yrs</span>
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Highest Education</label>
                  <select
                    value={incomeForm.education}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, education: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Doctorate">Doctorate (PhD / MD)</option>
                    <option value="Masters">Masters Degree</option>
                    <option value="Bachelors">Bachelors Degree</option>
                    <option value="Assoc-acdm">Associates Degree</option>
                    <option value="Some-college">Some College / Vocational</option>
                    <option value="HS-grad">High School Graduate</option>
                  </select>
                </div>

                {/* Occupation */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Occupation Sector</label>
                  <select
                    value={incomeForm.occupation}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, occupation: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Exec-Managerial">Executive & Management</option>
                    <option value="Prof-Specialty">Professional Specialty</option>
                    <option value="Tech-Support">Tech Support & IT Engineering</option>
                    <option value="Sales">Sales & Business Development</option>
                    <option value="Craft-repair">Craft & Specialized Repair</option>
                    <option value="Administrative">Administrative Support</option>
                    <option value="Other-service">Other Services</option>
                  </select>
                </div>

                {/* Hours per week */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-medium">Weekly Hours</label>
                    <span className="font-mono text-cyan-300 font-bold">
                      {incomeForm.hoursPerWeek} hrs/wk
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    step="1"
                    value={incomeForm.hoursPerWeek}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, hoursPerWeek: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10 hrs</span>
                    <span>70 hrs</span>
                  </div>
                </div>

                {/* Capital Gain */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Annual Capital Gains ($)</label>
                  <input
                    type="number"
                    min="0"
                    max="99999"
                    value={incomeForm.capitalGain}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        capitalGain: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Marital Status */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Marital Demographics</label>
                  <select
                    value={incomeForm.maritalStatus}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, maritalStatus: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Married-civ-spouse">Married (Civilian Spouse)</option>
                    <option value="Never-married">Never Married (Single)</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={incomeLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-950/60 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {incomeLoading ? (
                  <DollarSign className="w-5 h-5 animate-spin" />
                ) : (
                  <DollarSign className="w-5 h-5" />
                )}
                {incomeLoading ? 'Evaluating Census Model...' : 'Classify Household Income Threshold'}
              </button>
            </form>
          </div>

          {/* Right Column: Income Results (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {incomeResult ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Income Classification Result
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        incomeResult.prediction === '> $50,000 / year'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {incomeResult.prediction}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Probability &gt; $50k Bracket
                    </div>
                    <div className="text-3xl font-extrabold font-mono text-cyan-300 mt-1">
                      {Math.round(incomeResult.probabilityAbove50k * 100)}%
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Model Certainty:{' '}
                      <span className="text-white font-bold">{incomeResult.confidenceScore}%</span>
                    </div>
                  </div>

                  {/* Narrative */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-white block mb-1">Census Explanation:</span>
                    {incomeResult.explanation}
                  </div>

                  {/* Factor Drivers */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Demographic Weight Drivers
                    </span>
                    <div className="space-y-1.5">
                      {incomeResult.socioeconomicDrivers.map((driver, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-200">{driver.factor}</span>
                          <span
                            className={`font-mono font-bold ${
                              driver.impact === 'positive' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {driver.impact === 'positive' ? '+ Positive' : '- Downward'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                <DollarSign className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Census Classifier Ready</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Select demographic parameters or pick an occupation profile on the left, then click{' '}
                  <span className="text-emerald-300 font-semibold">Classify Household Income Threshold</span>.
                </p>
                <button
                  onClick={() => handlePredictIncome()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-slate-700 transition"
                >
                  Classify Sample Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
