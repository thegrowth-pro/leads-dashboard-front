"use client";

import { useState, useEffect } from "react";
import { checkWorkflowHealth } from "@/app/actions/workflow";
import { Circle, CircleCheck, CircleX } from "lucide-react";

export default function WorkflowStatus() {
	const [status, setStatus] = useState({
		status: 'loading',
		message: 'Verificando...'
	});

	useEffect(() => {
		const checkStatus = async () => {
			try {
				const { data, error } = await checkWorkflowHealth();
				
				if (error) {
					setStatus({
						status: 'inactive',
						message: 'Sistema no disponible'
					});
				} else {
					setStatus(data);
				}
			} catch (error) {
				setStatus({
					status: 'inactive',
					message: 'Sistema no disponible'
				});
			}
		};

		checkStatus();
		
		// Verificar cada 30 segundos
		const interval = setInterval(checkStatus, 30000);
		
		return () => clearInterval(interval);
	}, []);

	const getStatusIcon = () => {
		switch (status.status) {
			case 'active':
				return <CircleCheck className="h-4 w-4 text-green-600" />;
			case 'inactive':
				return <CircleX className="h-4 w-4 text-red-600" />;
			case 'loading':
			default:
				return <Circle className="h-4 w-4 text-gray-400 animate-pulse" />;
		}
	};

	const getStatusColor = () => {
		switch (status.status) {
			case 'active':
				return 'bg-green-50 border-green-200 text-green-700';
			case 'inactive':
				return 'bg-red-50 border-red-200 text-red-700';
			case 'loading':
			default:
				return 'bg-gray-50 border-gray-200 text-gray-700';
		}
	};

	return (
		<div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
			{getStatusIcon()}
			<span className="text-xs font-medium hidden sm:inline">
				{status.message}
			</span>
		</div>
	);
} 