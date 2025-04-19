"use client";

import { getClientRanking, getPodRanking, getSdrRanking } from "@/app/actions/dashboard";
import CardsGroup from "./CardsGroup";
import RankingTable from "./RankingTable";

import { Button } from "@/components/ui/button";
import Combobox from "@/components/ui/Combobox";
import { fetchClients } from "@/app/actions/clients";
import { fetchPods } from "@/app/actions/pods";
import { fetchUsers } from "@/app/actions/users";
import { useEffect, useState } from "react";
import { cn, filterDateOptions } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/ui/DatePicker";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getTotalStats } from "@/app/actions/dashboard";

export default function Home() {
	const [clientOptions, setClientOptions] = useState([]);
	const [selectedClient, setSelectedClient] = useState(null);
	const [isLoadingClients, setIsLoadingClients] = useState(true);
	const [podOptions, setPodOptions] = useState([]);
	const [selectedPod, setSelectedPod] = useState(null);
	const [isLoadingPods, setIsLoadingPods] = useState(true);
	const [userOptions, setUserOptions] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [isLoadingUsers, setIsLoadingUsers] = useState(true);
	const [selectedDateFilter, setSelectedDateFilter] = useState("");

	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [totals, setTotals] = useState([]);
	const [isLoadingTotals, setIsLoadingTotals] = useState(true);

	const [clientRank, setClientRank] = useState([]);
	const [podRank, setPodRank] = useState([]);
	const [sdrRank, setSdrRank] = useState([]);
	const [isLoadingClientRank, setIsLoadingClientRank] = useState(true);
	const [isLoadingPodRank, setIsLoadingPodRank] = useState(true);
	const [isLoadingSdrRank, setIsLoadingSdrRank] = useState(true);

	const fetchClientOptions = async () => {
		setIsLoadingClients(true);
		const { data, error } = await fetchClients();
		if (error) {
			console.error("error fetching client options", error);
			return;
		}

		setClientOptions(data);
		setIsLoadingClients(false);
	};

	const fetchPodOptions = async () => {
		setIsLoadingPods(true);
		const { data, error } = await fetchPods();
		if (error) {
			console.error("error fetching pod options", error);
			return;
		}

		setPodOptions(data);
		setIsLoadingPods(false);
	};

	const fetchUserOptions = async () => {
		setIsLoadingUsers(true);
		const { data, error } = await fetchUsers();
		if (error) {
			console.error("error fetching user options", error);
			return;
		}

		setUserOptions(data);
		setIsLoadingUsers(false);
	};

	const fetchTotals = async () => {
		setIsLoadingTotals(true);
		const { data, error } = await getTotalStats({
			clientId: selectedClient,
			podId: selectedPod,
			sdrId: selectedUser,
			startDate,
			endDate,
			selectedDateFilter,
		});
		if (error) {
			console.error("error fetching totals", error);
			return;
		}

		setTotals(data);
		setIsLoadingTotals(false);
	};

	const fetchClientsRank = async () => {
		setIsLoadingClientRank(true);
		const { data, error } = await getClientRanking({
			clientId: selectedClient,
			podId: selectedPod,
			sdrId: selectedUser,
			startDate,
			endDate,
			selectedDateFilter,
		});
		if (error) {
			console.error("error fetching client rank", error);
			return;
		}

		setClientRank(data);
		setIsLoadingClientRank(false);
	};

	const fetchPodsRank = async () => {
		setIsLoadingPodRank(true);
		const { data, error } = await getPodRanking({
			clientId: selectedClient,
			podId: selectedPod,
			sdrId: selectedUser,
			startDate,
			endDate,
			selectedDateFilter,
		});
		if (error) {
			console.error("error fetching pod rank", error);
			return;
		}

		setPodRank(data);
		setIsLoadingPodRank(false);
	};

	const fetchSdrsRank = async () => {
		setIsLoadingSdrRank(true);
		const { data, error } = await getSdrRanking({
			clientId: selectedClient,
			podId: selectedPod,
			sdrId: selectedUser,
			startDate,
			endDate,
			selectedDateFilter,
		});
		if (error) {
			console.error("error fetching sdr rank", error);
			return;
		}

		setSdrRank(data);
		setIsLoadingSdrRank(false);
	};

	useEffect(() => {
		fetchClientOptions();
		fetchPodOptions();
		fetchUserOptions();
	}, []);

	useEffect(() => {
		fetchTotals();
		fetchClientsRank();
		fetchPodsRank();
		fetchSdrsRank();
	}, [selectedClient, selectedPod, selectedUser, startDate, endDate]);

	const handleDateFilterChange = (value) => {
		setSelectedDateFilter(value);
		if (value === "custom") {
			return;
		} else {
			setStartDate(filterDateOptions.find((option) => option.value === value).start);
			setEndDate(filterDateOptions.find((option) => option.value === value).end);
		}
	};

	const handleCleanDateFilter = (e) => {
		e.stopPropagation();
		e.preventDefault();
		setSelectedDateFilter("");
		setStartDate(null);
		setEndDate(null);
	};

	return (
		<div className="flex flex-col gap-4 p-4 w-full">
			<div className="flex flex-col md:flex-row justify-end gap-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"bg-gray-100 w-full justify-between",
								selectedDateFilter && "border border-indigo-500 bg-accent"
							)}
						>
							<p className="">
								{selectedDateFilter
									? filterDateOptions.find((option) => option.value === selectedDateFilter).label
									: "Filtrar por fecha"}
							</p>
							{selectedDateFilter === "custom" && startDate && endDate && (
								<p className="text-xs text-gray-500">
									{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
								</p>
							)}
							{selectedDateFilter && (
								<p
									className="text-xs text-gray-500 hover:text-black cursor-pointer"
									onClick={handleCleanDateFilter}
								>
									x
								</p>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-auto p-4 bg-gray-50 flex flex-col gap-4">
						<RadioGroup
							className="flex flex-col gap-3"
							value={selectedDateFilter}
							onValueChange={handleDateFilterChange}
						>
							{filterDateOptions.map((option) => (
								<div className="flex items-center space-x-3" key={option.value}>
									<RadioGroupItem value={option.value} id={option.value} />
									<Label htmlFor={option.value}>{option.label}</Label>
								</div>
							))}

							{selectedDateFilter === "custom" && (
								<div className="flex flex-col gap-2">
									<DatePicker
										value={startDate}
										onChange={(value) =>
											setStartDate(new Date(new Date(value).setHours(0, 0, 0, 0)))
										}
										placeholder="Desde"
									/>
									<DatePicker
										value={endDate}
										onChange={(value) =>
											setEndDate(new Date(new Date(value).setHours(23, 59, 59, 999)))
										}
										placeholder="Hasta"
										disableDatesBefore={startDate}
									/>
								</div>
							)}
						</RadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
				<Combobox
					placeholder="Cliente"
					items={clientOptions}
					value={selectedClient}
					onChange={(value) => setSelectedClient(value)}
					isLoading={isLoadingClients}
					disabled={isLoadingClients}
					className="w-full"
				/>
				<Combobox
					placeholder="Pod"
					items={podOptions}
					value={selectedPod}
					onChange={(value) => setSelectedPod(value)}
					isLoading={isLoadingPods}
					disabled={isLoadingPods}
					className="w-full"
				/>
				<Combobox
					placeholder="SDR"
					items={userOptions}
					value={selectedUser}
					onChange={(value) => setSelectedUser(value)}
					isLoading={isLoadingUsers}
					disabled={isLoadingUsers}
					className="w-full"
				/>
			</div>

			{/* Top Cards */}
			<CardsGroup
				data={totals}
				time={filterDateOptions.find((option) => option.value === selectedDateFilter)?.label || "Desde siempre"}
				isLoading={isLoadingTotals}
			/>
			<div className="flex flex-col lg:flex-row gap-4">
				<div className="p-4 flex flex-col gap-4 bg-gray-50 border-2 border-gray-300 rounded-xl shadow-gray-400 w-full lg:w-1/3 overflow-x-auto">
					<RankingTable label="Clientes" data={clientRank} isLoading={isLoadingClientRank} />
				</div>
				<div className="p-4 flex flex-col gap-4 bg-gray-50 border-2 border-gray-300 rounded-xl shadow-gray-400 w-full lg:w-1/3 overflow-x-auto">
					<RankingTable label="Pods" data={podRank} isLoading={isLoadingPodRank} />
				</div>
				<div className="p-4 flex flex-col gap-4 bg-gray-50 border-2 border-gray-300 rounded-xl shadow-gray-400 w-full lg:w-1/3 overflow-x-auto">
					<RankingTable label="SDRs" data={sdrRank} isLoading={isLoadingSdrRank} />
				</div>
			</div>
		</div>
	);
}
