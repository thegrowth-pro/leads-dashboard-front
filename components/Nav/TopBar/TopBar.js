import TopBarUser from "./TopBarUser";
import ToggleDrawerButton from "./ToggleDrawerButton";
import Breadcrumb from "./Breadcrumb";

export default function TopBar() {
	return (
		<div className="flex justify-between items-center bg-sidebar h-14 py-4 px-2 border-b-2 border-gray-300">
			<div className="flex gap-4 items-center">
				<ToggleDrawerButton />
				<Breadcrumb />
			</div>

			<TopBarUser />
		</div>
	);
}
