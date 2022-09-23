import { useAccount, usePrepareContractWrite, useContractWrite, useContractRead } from 'wagmi'
import { ethereum } from './utils/contractAddress'
import ABI_ERC20 from './utils/ABI_ERC20.json'
import ABI_Npng from './utils/ABI_Npng.json'
import { useState } from 'react'
import { ethers } from 'ethers'

function Approve({ amount, amountApproved }: { amount: number, amountApproved: number }) {
    const { config } = usePrepareContractWrite({
        addressOrName: ethereum.usdcContract,
        contractInterface: ABI_ERC20,
        functionName: 'approve',
        args: [ethereum.npngContract, amount * 10 ** 6]
    })
    const { write } = useContractWrite(config)

    return (
        <a href="/" className={(!write || amount <= amountApproved) ? "button-4 inactiveLink" : "button-4"} onClick={(e) => {
            e.preventDefault()
            write?.()
        }
        }>Approve USDC Amount</a>
    )
}


function Deposit({ setModalDeposit, amount }: { setModalDeposit: React.Dispatch<React.SetStateAction<boolean>>, amount: number }) {
    const { config } = usePrepareContractWrite({
        addressOrName: ethereum.npngContract,
        contractInterface: ABI_Npng,
        functionName: 'depositOnAave',
        args: [amount * 10 ** 6],
    })
    const { write } = useContractWrite({
        ...config,
        onSettled(data, error) {
            console.log('Settled', { data, error })
            setModalDeposit(false)
        },
    })

    return (
        <a href="/" className={(!write) ? "button-4 inactiveLink" : "button-4"} onClick={(e) => {
            e.preventDefault()
            write?.()
        }
        }>Deposit</a>
    )
}

function ModalDeposit({ setModalDeposit, amount }: { setModalDeposit: React.Dispatch<React.SetStateAction<boolean>>, amount: number }) {
    const [amountApproved, setAmountApproved] = useState(0)
    const { address } = useAccount();
    const { data } = useContractRead({
        addressOrName: ethereum.usdcContract,
        contractInterface: ABI_ERC20,
        functionName: 'allowance',
        watch: true,
        args: [address, ethereum.npngContract],
        onSuccess(data) {
            setAmountApproved(parseFloat(ethers.utils.formatUnits(data?._hex, 6)))
        },
    })

    return (
        <div className="modal-wrapper">
            <div className="modal-outside-trigger" onClick={(e) => { setModalDeposit(false) }}></div>
            <div className="modal-inner-wrapper deposit-modal">
                <div className="div-block-41" onClick={(e) => { setModalDeposit(false) }}><img src="images/close.png" loading="lazy" width="20" height="20" data-w-id="173262e3-a8b5-4db7-7eb1-8224456fe284" alt="" className="image-18" /></div>
                <div className="div-block-40"><img src="images/polygon-matic-logo.png" loading="lazy" width="135" alt="" className="image-15" /></div>
                <h2>Deposit confirmation</h2>
                <p>Prizes are awarded daily! Don&#x27;t forget to come back to claim any prizes. Unclaimed prizes expire after 60 days, for more info see <a href="/userguide/faq" target="_blank" className="link-58">here</a>.</p>
                <div className="div-block-39">
                    <div className="div-block-36">
                        <div className="div-block-37"><img src="images/usd-coin-usdc-logo.png" loading="lazy" srcSet="images/usd-coin-usdc-logo-p-500.png 500w, images/usd-coin-usdc-logo-p-800.png 800w, images/usd-coin-usdc-logo-p-2000.png 2000w, images/usd-coin-usdc-logo.png 2000w" sizes="(max-width: 479px) 0px, 100vw" alt="" className="image-16" />
                            <div className="text-block-41">USDC</div>
                        </div>
                        <div className="text-block-43">{amount}</div>
                    </div>
                    <div className="div-block-38"><img src="images/next.png" loading="lazy" alt="" className="image-17" /></div>
                    <div className="div-block-36">
                        <div className="div-block-37"><img src="images/NPaUSDC.png" loading="lazy" alt="" className="image-16" />
                            <div className="text-block-41">NPaUSDC</div>
                        </div>
                        <div className="text-block-43">{amount}</div>
                    </div>
                </div>
                <div className="div-block-45">
                    <Approve amount={amount} amountApproved={amountApproved} />
                    {(amount !== 0 && amount <= amountApproved) && <Deposit setModalDeposit={setModalDeposit} amount={amount} />}
                    {(amount > amountApproved) && <a href="/" className="button-4 inactiveLink">Deposit</a>}

                </div>
            </div>
        </div>
    )
}

export default ModalDeposit;